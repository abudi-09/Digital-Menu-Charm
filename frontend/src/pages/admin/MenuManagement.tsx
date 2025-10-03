import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Grid3x3,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatsCard } from "@/components/admin/StatsCard";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { MenuItem } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";
import {
  useMenuQuery,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "@/hooks/useMenuApi";

const MenuManagement = () => {
  // Load items from backend only. Do NOT fall back to bundled mock data.
  const { data: backendItems, isLoading, isError } = useMenuQuery();

  type BackendMenuItem = Omit<MenuItem, "id"> & { _id: string };

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Sync backend items into local state once they arrive. If the backend is
  // unavailable (error) or returns no data, keep the list empty rather than
  // showing bundled mock data.
  useEffect(() => {
    if (isLoading) return;

    if (backendItems && backendItems.length > 0) {
      const mapped = backendItems.map((b: BackendMenuItem) => ({
        id: b._id,
        name: b.name,
        category: b.category,
        price: b.price,
        description: b.description,
        fullDescription: b.fullDescription ?? "",
        image: b.image ?? "",
        ingredients: b.ingredients ?? [],
        allergens: b.allergens ?? [],
        prepTime: b.prepTime ?? "",
        portionSize: b.portionSize ?? "",
        available: typeof b.available === "boolean" ? b.available : true,
      }));
      setMenuItems(mapped);
    } else {
      // backend returned no data or is unreachable -> show empty list
      setMenuItems([]);
    }
  }, [backendItems, isLoading, isError]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const stats = {
    totalItems: menuItems.length,
    totalCategories: Array.from(new Set(menuItems.map((item) => item.category)))
      .length,
    outOfStock: menuItems.filter((item) => !item.available).length,
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      // call backend delete
      deleteMutation.mutate(itemToDelete.id, {
        onSuccess: () => {
          toast({
            title: "Item deleted",
            description: `${itemToDelete.name} has been removed from the menu`,
          });
          setItemToDelete(null);
        },
        onError: () => {
          toast({
            title: "Delete failed",
            description: `Could not delete ${itemToDelete.name}`,
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleFormSubmit = (data: Partial<MenuItem>) => {
    if (selectedItem) {
      // Update existing item
      updateMutation.mutate(
        { id: selectedItem.id, payload: data },
        {
          onSuccess: () => {
            toast({
              title: "Item updated",
              description: `${data.name} has been updated successfully`,
            });
            setSelectedItem(null);
          },
          onError: () => {
            toast({
              title: "Update failed",
              description: `Could not update ${data.name}`,
              variant: "destructive",
            });
          },
        }
      );
    } else {
      // Add new item
      createMutation.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Item added",
            description: `${data.name} has been added to the menu`,
          });
        },
        onError: () => {
          toast({
            title: "Create failed",
            description: `Could not create ${data.name}`,
            variant: "destructive",
          });
        },
      });
    }
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-2">
            Menu Management
          </h1>
          <p className="text-muted-foreground">
            Manage your restaurant menu items
          </p>
        </div>
        <Button
          onClick={handleAddItem}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          description="Active menu items"
          loading={isLoading}
        />
        <StatsCard
          title="Categories"
          value={stats.totalCategories}
          icon={Grid3x3}
          description="Menu categories"
          loading={isLoading}
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={AlertCircle}
          description="Unavailable items"
          loading={isLoading}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Menu Items Table/Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border bg-gradient-card hover:shadow-hover transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image */}
                <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold font-serif text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge
                      variant={item.available ? "default" : "secondary"}
                      className={
                        item.available ? "bg-primary/10 text-primary" : ""
                      }
                    >
                      {item.available ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(item)}
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No items found matching your search"
                : "No menu items yet"}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              {selectedItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            item={selectedItem}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagement;
