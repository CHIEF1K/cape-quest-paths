import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryColors, categoryIcons } from '@/data/hiddenGems';

interface CategoryFilterProps {
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
}

const categories = ['food', 'hiking', 'culture', 'nature', 'nightlife', 'history'];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategories, 
  onCategoryToggle 
}) => {
  return (
    <Card className="shadow-floating">
      <CardContent className="p-4">
        <h3 className="font-semibold text-primary mb-3 text-sm">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategories.length === 0 ? "ocean" : "outline"}
            size="sm"
            onClick={() => {
              // Clear all filters
              selectedCategories.forEach(cat => onCategoryToggle(cat));
            }}
            className="text-xs"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? "ocean" : "outline"}
              size="sm"
              onClick={() => onCategoryToggle(category)}
              className="text-xs capitalize"
            >
              <span className="mr-1">{categoryIcons[category as keyof typeof categoryIcons]}</span>
              {category}
            </Button>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="text-xs capitalize"
                style={{ 
                  backgroundColor: categoryColors[category as keyof typeof categoryColors] + '20',
                  borderColor: categoryColors[category as keyof typeof categoryColors] + '40'
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryFilter;