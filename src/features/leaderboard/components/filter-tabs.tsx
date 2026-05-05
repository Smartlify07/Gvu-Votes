import { Button } from "@/components/ui/button"
import { useCategories } from "@/features/contestants/hooks"
import { cn } from "@/lib/utils"


export type FilterTabsProps = {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function FilterTabs({ selectedCategory, onSelectCategory }: FilterTabsProps) {
  const { data: categories } = useCategories()
  
  return (
    <section className="flex flex-wrap justify-center gap-2">
      {categories?.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className={cn("rounded-full")}
        >
          {category.label}
        </Button>
      ))}
    </section>
  )
}