import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MenuItem } from '@/types/menu';

const menuItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive').max(9999, 'Price too high'),
  description: z.string().trim().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
  fullDescription: z.string().trim().min(1, 'Full description is required').max(1000, 'Full description must be less than 1000 characters'),
  ingredients: z.string().trim().min(1, 'Ingredients are required'),
  allergens: z.string().trim(),
  prepTime: z.string().trim().min(1, 'Prep time is required'),
  portionSize: z.string().trim().min(1, 'Portion size is required'),
  available: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSubmit: (data: Partial<MenuItem>) => void;
  onCancel: () => void;
}

export const MenuItemForm = ({ item, onSubmit, onCancel }: MenuItemFormProps) => {
  const [imagePreview, setImagePreview] = useState<string>(item?.image || '');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item ? {
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      fullDescription: item.fullDescription,
      ingredients: item.ingredients.join(', '),
      allergens: item.allergens.join(', '),
      prepTime: item.prepTime,
      portionSize: item.portionSize,
      available: item.available,
    } : {
      available: true,
    },
  });

  const available = watch('available');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (data: MenuItemFormData) => {
    const formattedData = {
      ...data,
      ingredients: data.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      allergens: data.allergens.split(',').map(a => a.trim()).filter(Boolean),
      image: imagePreview || item?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Item Image</Label>
        <div className="flex gap-4 items-start">
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setImageFile(null);
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex-1">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Name & Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Truffle Pasta"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            defaultValue={item?.category}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Starters">Starters</SelectItem>
              <SelectItem value="Main Course">Main Course</SelectItem>
              <SelectItem value="Desserts">Desserts</SelectItem>
              <SelectItem value="Drinks">Drinks</SelectItem>
              <SelectItem value="Specials">Specials</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Price, Prep Time, Portion Size */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder="0.00"
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prepTime">Prep Time *</Label>
          <Input
            id="prepTime"
            {...register('prepTime')}
            placeholder="e.g., 15 mins"
            className={errors.prepTime ? 'border-destructive' : ''}
          />
          {errors.prepTime && (
            <p className="text-xs text-destructive">{errors.prepTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portionSize">Portion Size *</Label>
          <Input
            id="portionSize"
            {...register('portionSize')}
            placeholder="e.g., 300g"
            className={errors.portionSize ? 'border-destructive' : ''}
          />
          {errors.portionSize && (
            <p className="text-xs text-destructive">{errors.portionSize.message}</p>
          )}
        </div>
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Short Description * (shown in menu list)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description for the menu card"
          rows={2}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Full Description */}
      <div className="space-y-2">
        <Label htmlFor="fullDescription">Full Description * (shown in details)</Label>
        <Textarea
          id="fullDescription"
          {...register('fullDescription')}
          placeholder="Complete description with preparation details"
          rows={4}
          className={errors.fullDescription ? 'border-destructive' : ''}
        />
        {errors.fullDescription && (
          <p className="text-xs text-destructive">{errors.fullDescription.message}</p>
        )}
      </div>

      {/* Ingredients & Allergens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ingredients">Ingredients * (comma-separated)</Label>
          <Textarea
            id="ingredients"
            {...register('ingredients')}
            placeholder="e.g., Flour, Eggs, Butter, Salt"
            rows={3}
            className={errors.ingredients ? 'border-destructive' : ''}
          />
          {errors.ingredients && (
            <p className="text-xs text-destructive">{errors.ingredients.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergens">Allergens (comma-separated)</Label>
          <Textarea
            id="allergens"
            {...register('allergens')}
            placeholder="e.g., Dairy, Gluten, Nuts"
            rows={3}
          />
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
        <div className="space-y-0.5">
          <Label htmlFor="available" className="text-base font-semibold">Available</Label>
          <p className="text-sm text-muted-foreground">Mark this item as available for customers</p>
        </div>
        <Switch
          id="available"
          checked={available}
          onCheckedChange={(checked) => setValue('available', checked)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {item ? 'Update Item' : 'Add Item'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
