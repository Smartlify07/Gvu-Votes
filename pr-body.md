## Summary
- Add Category type (id, label, value, created_at)
- Add getCategories function to fetch from supabase
- Add useCategories hook
- Add category_id to ContestantPayload
- Update registration and edit forms to use categories from supabase
- Update filter tabs and contestants list to use category_id
- Include categories join in getContestants query