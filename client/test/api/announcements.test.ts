import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/models", () => ({
  Announcement: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("mongoose", () => {
  const isValid = vi.fn((id: string) => /^[0-9a-fA-F]{24}$/.test(id));
  return {
    default: { Types: { ObjectId: { isValid } } },
    Types: { ObjectId: { isValid } },
  };
});

import { GET as listAnnouncements, POST as createAnnouncement } from "@/app/api/announcements/route";
import { PUT as updateAnnouncement, DELETE as deleteAnnouncement } from "@/app/api/announcements/[id]/route";
import { auth } from "@/lib/auth-server";
import { Announcement } from "@/lib/models";

const mockAuth = vi.mocked(auth) as unknown as {
  mockResolvedValue: (value: unknown) => void;
};
const mockAnnouncement = vi.mocked(Announcement);

const ANNOUNCEMENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const ANNOUNCEMENT_OTHER = "bbbbbbbbbbbbbbbbbbbbbbbb";
const AUTHOR_ID = "cccccccccccccccccccccccc";
const OTHER_USER = "dddddddddddddddddddddddd";

function createMockRequest(url: string, method = "GET", body?: unknown): Request {
  return new Request(url, { method, body: body ? JSON.stringify(body) : undefined });
}

function lean(value: unknown) {
  return { lean: vi.fn().mockResolvedValue(value) } as any;
}

function chainFind(value: unknown) {
  const leanMock = vi.fn().mockResolvedValue(value);
  const populate = vi.fn().mockReturnValue({ lean: leanMock });
  const limit = vi.fn().mockReturnValue({ populate });
  const skip = vi.fn().mockReturnValue({ limit });
  const sort = vi.fn().mockReturnValue({ skip });
  return { chain: { sort, skip, limit, populate }, sort, skip, limit };
}

const validBody = { title: "Exam schedule", body: "Midterms next week." };

describe("Announcements API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/announcements", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await listAnnouncements(createMockRequest("http://localhost/api/announcements"));
      expect(res.status).toBe(401);
    });

    it("returns 400 for an invalid page", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const res = await listAnnouncements(createMockRequest("http://localhost/api/announcements?page=0"));
      expect(res.status).toBe(400);
    });

    it("returns announcements newest first with populated author", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const { chain } = chainFind([
        {
          _id: ANNOUNCEMENT_OTHER,
          title: "Second",
          body: "b2",
          postedBy: { _id: AUTHOR_ID, name: "Ann", email: "ann@x.com", role: "teacher" },
          createdAt: new Date("2026-02-02"),
          updatedAt: new Date("2026-02-02"),
        },
        {
          _id: ANNOUNCEMENT_ID,
          title: "First",
          body: "b1",
          postedBy: { _id: AUTHOR_ID, name: "Ann", email: "ann@x.com", role: "teacher" },
          createdAt: new Date("2026-02-01"),
          updatedAt: new Date("2026-02-01"),
        },
      ]);
      mockAnnouncement.find.mockReturnValue(chain as any);

      const res = await listAnnouncements(createMockRequest("http://localhost/api/announcements"));
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(2);
      expect(json.data[0].title).toBe("Second");
      expect(json.data[0].author.id).toBe(AUTHOR_ID);
      expect(json.data[0].author.name).toBe("Ann");
    });

    it("sorts newest first and paginates", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const { chain, sort, skip, limit } = chainFind([]);
      mockAnnouncement.find.mockReturnValue(chain as any);

      const res = await listAnnouncements(createMockRequest("http://localhost/api/announcements?page=2"));
      expect(res.status).toBe(200);
      expect(mockAnnouncement.find).toHaveBeenCalledWith({});
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skip).toHaveBeenCalledWith(10);
      expect(limit).toHaveBeenCalledWith(10);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      mockAnnouncement.find.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await listAnnouncements(createMockRequest("http://localhost/api/announcements"));
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/announcements", () => {
    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await createAnnouncement(createMockRequest("http://localhost/api/announcements", "POST", validBody));
      expect(res.status).toBe(401);
    });

    it("returns 403 for a student", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "student" } });
      const res = await createAnnouncement(createMockRequest("http://localhost/api/announcements", "POST", validBody));
      expect(res.status).toBe(403);
    });

    it("returns 400 for a missing field", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      const res = await createAnnouncement(
        createMockRequest("http://localhost/api/announcements", "POST", { title: "Only title" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 for unknown fields", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      const res = await createAnnouncement(
        createMockRequest("http://localhost/api/announcements", "POST", { ...validBody, extra: "nope" })
      );
      expect(res.status).toBe(400);
    });

    it("creates an announcement as a teacher", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, name: "Ann", email: "ann@x.com", role: "teacher" } });
      mockAnnouncement.create.mockResolvedValue({
        _id: ANNOUNCEMENT_ID,
        title: validBody.title,
        body: validBody.body,
        postedBy: AUTHOR_ID,
        createdAt: new Date("2026-02-01"),
        updatedAt: new Date("2026-02-01"),
      } as any);

      const res = await createAnnouncement(createMockRequest("http://localhost/api/announcements", "POST", validBody));
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.id).toBe(ANNOUNCEMENT_ID);
      expect(json.data.author.id).toBe(AUTHOR_ID);
      expect(json.data.author.name).toBe("Ann");
    });

    it("creates an announcement as an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, name: "Boss", email: "boss@x.com", role: "admin" } });
      mockAnnouncement.create.mockResolvedValue({
        _id: ANNOUNCEMENT_ID,
        title: validBody.title,
        body: validBody.body,
        postedBy: AUTHOR_ID,
        createdAt: new Date("2026-02-01"),
        updatedAt: new Date("2026-02-01"),
      } as any);

      const res = await createAnnouncement(createMockRequest("http://localhost/api/announcements", "POST", validBody));
      expect(res.status).toBe(201);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      mockAnnouncement.create.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await createAnnouncement(createMockRequest("http://localhost/api/announcements", "POST", validBody));
      expect(res.status).toBe(500);
    });
  });

  describe("PUT /api/announcements/:id", () => {
    const put = (body: unknown, id = ANNOUNCEMENT_ID) =>
      updateAnnouncement(createMockRequest(`http://localhost/api/announcements/${id}`, "PUT", body), {
        params: Promise.resolve({ id }),
      });

    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await put({ title: "New" });
      expect(res.status).toBe(401);
    });

    it("returns 400 for an invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      const res = await put({ title: "New" }, "nope");
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid body", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      const res = await put({ extra: "nope" });
      expect(res.status).toBe(400);
    });

    it("returns 404 when the announcement does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      mockAnnouncement.findById.mockReturnValue(lean(null));
      const res = await put({ title: "New" });
      expect(res.status).toBe(404);
    });

    it("returns 403 when the user is not the owner", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "teacher" } });
      mockAnnouncement.findById.mockReturnValue(lean({ _id: ANNOUNCEMENT_ID, postedBy: AUTHOR_ID }));
      const res = await put({ title: "New" });
      expect(res.status).toBe(403);
    });

    it("returns 403 when an admin is not the owner", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockAnnouncement.findById.mockReturnValue(lean({ _id: ANNOUNCEMENT_ID, postedBy: AUTHOR_ID }));
      const res = await put({ title: "New" });
      expect(res.status).toBe(403);
    });

    it("updates the announcement as the owner", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, name: "Ann", email: "ann@x.com", role: "teacher" } });
      mockAnnouncement.findById.mockReturnValue(lean({ _id: ANNOUNCEMENT_ID, postedBy: AUTHOR_ID }));
      mockAnnouncement.findByIdAndUpdate.mockReturnValue(
        lean({
          _id: ANNOUNCEMENT_ID,
          title: "New",
          body: "Updated body",
          postedBy: AUTHOR_ID,
          createdAt: new Date("2026-02-01"),
          updatedAt: new Date("2026-02-01"),
        })
      );
      const res = await put({ title: "New" });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.title).toBe("New");
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      mockAnnouncement.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await put({ title: "New" });
      expect(res.status).toBe(500);
    });
  });

  describe("DELETE /api/announcements/:id", () => {
    const del = (id = ANNOUNCEMENT_ID) =>
      deleteAnnouncement(createMockRequest(`http://localhost/api/announcements/${id}`, "DELETE"), {
        params: Promise.resolve({ id }),
      });

    it("returns 401 when not authenticated", async () => {
      mockAuth.mockResolvedValue(null);
      const res = await del();
      expect(res.status).toBe(401);
    });

    it("returns 400 for an invalid ID", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "admin" } });
      const res = await del("nope");
      expect(res.status).toBe(400);
    });

    it("returns 404 when the announcement does not exist", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "admin" } });
      mockAnnouncement.findById.mockReturnValue(lean(null));
      const res = await del();
      expect(res.status).toBe(404);
    });

    it("returns 403 for a non-owner non-admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "teacher" } });
      mockAnnouncement.findById.mockReturnValue(lean({ _id: ANNOUNCEMENT_ID, postedBy: AUTHOR_ID }));
      const res = await del();
      expect(res.status).toBe(403);
    });

    it("deletes the announcement as the owner", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "teacher" } });
      mockAnnouncement.findById.mockReturnValue(lean({ _id: ANNOUNCEMENT_ID, postedBy: AUTHOR_ID }));
      mockAnnouncement.findByIdAndDelete.mockResolvedValue({ _id: ANNOUNCEMENT_ID } as any);
      const res = await del();
      expect(res.status).toBe(200);
      expect(mockAnnouncement.findByIdAndDelete).toHaveBeenCalledWith(ANNOUNCEMENT_ID);
    });

    it("deletes another author's announcement as an admin", async () => {
      mockAuth.mockResolvedValue({ user: { id: OTHER_USER, role: "admin" } });
      mockAnnouncement.findById.mockReturnValue(lean({ _id: ANNOUNCEMENT_ID, postedBy: AUTHOR_ID }));
      mockAnnouncement.findByIdAndDelete.mockResolvedValue({ _id: ANNOUNCEMENT_ID } as any);
      const res = await del();
      expect(res.status).toBe(200);
    });

    it("returns 500 on database error", async () => {
      mockAuth.mockResolvedValue({ user: { id: AUTHOR_ID, role: "admin" } });
      mockAnnouncement.findById.mockImplementation(() => {
        throw new Error("db down");
      });
      const res = await del();
      expect(res.status).toBe(500);
    });
  });
});
