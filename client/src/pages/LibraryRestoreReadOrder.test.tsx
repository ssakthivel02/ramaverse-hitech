import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import Library from "./Library";

const mocks = vi.hoisted(() => ({ importData: vi.fn(), clearAllData: vi.fn() }));
vi.mock("@/components/RamaNavbar", () => ({ RamaNavbar: () => null }));
vi.mock("@/components/RamaFooter", () => ({ RamaFooter: () => null }));
vi.mock("@/contexts/LibraryContext", () => ({
  useLibrary: () => ({
    bookmarks: [], journalNotes: [], storageFailed: false,
    removeBookmark: vi.fn(), addJournalNote: vi.fn(), deleteJournalNote: vi.fn(), exportData: vi.fn(),
    importData: mocks.importData, clearAllData: mocks.clearAllData,
  }),
}));

function pendingFile(name: string) {
  let resolve!: (value: string) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<string>((yes, no) => { resolve = yes; reject = no; });
  const file = new File(["synthetic"], name, { type: "application/json" });
  Object.defineProperty(file, "text", { value: () => promise });
  return { file, resolve, reject };
}
function select(file: File) {
  fireEvent.change(screen.getByLabelText("Choose RamaVerse backup file"), { target: { files: [file] } });
}
async function finish(file: ReturnType<typeof pendingFile>, value: string) {
  await act(async () => { file.resolve(value); await Promise.resolve(); });
}
async function fail(file: ReturnType<typeof pendingFile>) {
  await act(async () => { file.reject(new Error("Synthetic read failure")); await Promise.resolve(); });
}

describe("Library backup reads respect newer user actions", () => {
  beforeEach(() => {
    mocks.importData.mockReset().mockReturnValue(true);
    mocks.clearAllData.mockReset();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("shows pending feedback and imports a current completed read", async () => {
    render(<Library />);
    const file = pendingFile("current.json");
    select(file.file);
    expect(screen.getByText("Reading backup file…").getAttribute("role")).toBe("status");
    expect(mocks.importData).not.toHaveBeenCalled();
    await finish(file, "CURRENT");
    expect(mocks.importData).toHaveBeenCalledTimes(1);
    expect(mocks.importData).toHaveBeenCalledWith("CURRENT");
    expect(screen.getByText("Backup restored to this browser.")).toBeTruthy();
  });

  it("ignores an older successful read after the newer backup has completed", async () => {
    render(<Library />);
    const older = pendingFile("older.json");
    const newer = pendingFile("newer.json");
    select(older.file); select(newer.file);
    await finish(newer, "NEW");
    await finish(older, "OLD");
    expect(mocks.importData).toHaveBeenCalledTimes(1);
    expect(mocks.importData).toHaveBeenCalledWith("NEW");
    expect(screen.getByText("Backup restored to this browser.")).toBeTruthy();
  });

  it("ignores an older read error while the newer read is still pending", async () => {
    render(<Library />);
    const older = pendingFile("older.json");
    const newer = pendingFile("newer.json");
    select(older.file); select(newer.file);
    await fail(older);
    expect(screen.getByText("Reading backup file…")).toBeTruthy();
    expect(screen.queryByText(/Backup could not be restored/)).toBeNull();
    await finish(newer, "NEW");
    expect(mocks.importData).toHaveBeenCalledTimes(1);
    expect(mocks.importData).toHaveBeenCalledWith("NEW");
  });

  it.each(["resolve", "reject"] as const)("a confirmed clear cancels a pending read that later %ss", async outcome => {
    render(<Library />);
    const file = pendingFile("slow.json");
    select(file.file);
    fireEvent.click(screen.getByRole("button", { name: "Clear All" }));
    expect(mocks.clearAllData).toHaveBeenCalledOnce();
    if (outcome === "resolve") await finish(file, "OLD"); else await fail(file);
    expect(mocks.importData).not.toHaveBeenCalled();
    expect(screen.queryByText("Reading backup file…")).toBeNull();
    expect(screen.queryByText("Backup restored to this browser.")).toBeNull();
    expect(screen.queryByText(/Backup could not be restored/)).toBeNull();
  });

  it("a dismissed clear leaves the current restore intact", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<Library />);
    const file = pendingFile("slow.json");
    select(file.file);
    fireEvent.click(screen.getByRole("button", { name: "Clear All" }));
    expect(mocks.clearAllData).not.toHaveBeenCalled();
    await finish(file, "CURRENT");
    expect(mocks.importData).toHaveBeenCalledTimes(1);
    expect(mocks.importData).toHaveBeenCalledWith("CURRENT");
  });

  it.each(["resolve", "reject"] as const)("unmount cancels a pending read that later %ss", async outcome => {
    const view = render(<Library />);
    const file = pendingFile("slow.json");
    select(file.file);
    view.unmount();
    if (outcome === "resolve") await finish(file, "OLD"); else await fail(file);
    expect(mocks.importData).not.toHaveBeenCalled();
  });

  it("reports a current read error and allows a subsequent retry", async () => {
    render(<Library />);
    const bad = pendingFile("retry.json");
    select(bad.file);
    await fail(bad);
    expect(screen.getByText(/Backup could not be restored/).getAttribute("role")).toBe("alert");
    const retry = pendingFile("retry.json");
    select(retry.file);
    await finish(retry, "RETRY");
    expect(mocks.importData).toHaveBeenCalledTimes(1);
    expect(mocks.importData).toHaveBeenCalledWith("RETRY");
    expect(screen.queryByText(/Backup could not be restored/)).toBeNull();
  });
});
