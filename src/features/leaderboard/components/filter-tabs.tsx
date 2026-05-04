import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = [
  "All",
  "Mr Gvu",
  "Miss GVU",
  "Best Ebony Male",
  "Best Ebony Female",
  "Best dressed",
  "Pageantry",
]

export type FilterTabsProps = {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function FilterTabs({ selectedCategory, onSelectCategory }: FilterTabsProps) {
  return (
    <section className="flex flex-wrap justify-center gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category)}
          className={cn("rounded-full")}
        >
          {category}
        </Button>
      ))}
    </section>
  )
}