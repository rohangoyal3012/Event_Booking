import Button from "./Button";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPageNumbers = (): (number | "…")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const left = Math.max(2, page - 1);
    const right = Math.min(pages - 1, page + 1);
    const nums: (number | "…")[] = [1];
    if (left > 2) nums.push("…");
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < pages - 1) nums.push("…");
    nums.push(pages);
    return nums;
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{from}</span>–
        <span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{total}</span> results
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="ghost"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </Button>
        {getPageNumbers().map((n, i) =>
          n === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-gray-400 select-none"
            >
              …
            </span>
          ) : (
            <Button
              key={n}
              variant={n === page ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(n as number)}
              aria-current={n === page ? "page" : undefined}
            >
              {n}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next ›
        </Button>
      </nav>
    </div>
  );
}
