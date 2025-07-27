import { ref } from 'vue'

const categories = ref<{name: string, color: string}[]>([])

export const useCategoriesStore = () => {
  const setCategories = (newCategories: {name: string, color: string}[]) => {
    categories.value = newCategories
  }
  
  const getCategoryColor = (categoryName: string) => {
    const category = categories.value.find(c => c.name === categoryName)
    return category ? category.color : '#eee'
  }
  
  return {
    categories,
    setCategories,
    getCategoryColor
  }
} 