import { Button } from "@/components/ui/button"
import { useCategories } from "@/features/contestants/hooks"


export type FilterTabsProps = {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function FilterTabs({ selectedCategory, onSelectCategory }: FilterTabsProps) {
  const { data: categories } = useCategories()
  const categoryFilters = [
    { label: "All", value: "All" },
    ...(categories?.map((c) => ({ label: c.label, value: c.id })) ?? []),
  ]
  return (
    <section className="flex flex-wrap justify-center gap-2">
      {categoryFilters?.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.value)}
          className="rounded-full"
        >
          {category.label}
        </Button>
      ))}
    </section>
  )
}