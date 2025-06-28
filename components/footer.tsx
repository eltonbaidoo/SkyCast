import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground mt-8">
      <p>
        Made by{" "}
        <Link
          href="https://eltonbaidoo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          eltonbaidoo.com
        </Link>
      </p>
    </footer>
  )
}
