import React, { useMemo, useState, useEffect } from "react";
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
  useCategoriesQuery,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "@/hooks/useMenuApi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const MenuManagement = () => {
  // Pagination & filtering state
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);

  // Load paginated items from backend. Passing params ensures paged response shape.
  const {
    data: paged,
    isLoading,
    isFetching,
    isError,
  } = useMenuQuery({ category, page, limit });
  const { data: categories } = useCategoriesQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  // Map backend items (paged.items) to UI shape
  const itemsFromBackend: MenuItem[] = useMemo(() => {
    const items = paged?.items ?? [];
    return items.map((b) => ({
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
  }, [paged]);

  const totalPages = paged?.totalPages ?? 1;
  const totalItemsAll = paged?.total ?? 0;

  const stats = {
    totalItems: totalItemsAll,
    totalCategories: (categories ?? []).length,
    outOfStock: itemsFromBackend.filter((item) => !item.available).length,
  };

  const filteredItems = itemsFromBackend.filter(
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

  // If current page becomes out of range (e.g., after deletions), snap back
  useEffect(() => {
    const pages = totalPages || 1;
    if (page > pages) {
      setPage(pages);
    }
  }, [totalPages, page]);

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
          description={
            category === "all" ? "All items" : `Filtered by ${category}`
          }
          loading={isLoading || isFetching}
        />
        <StatsCard
          title="Categories"
          value={stats.totalCategories}
          icon={Grid3x3}
          description="Menu categories"
          loading={isLoading || isFetching}
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={AlertCircle}
          description="Unavailable items"
          loading={isLoading || isFetching}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 md:justify-end">
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Menu Items Table/Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {(isFetching && itemsFromBackend.length === 0
            ? Array.from({ length: limit })
            : filteredItems
          ).map((item, i) => (
            <div
              key={(item as MenuItem)?.id ?? `skeleton-${i}`}
              className="p-4 rounded-lg border border-border bg-gradient-card hover:shadow-hover transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image */}
                {isFetching && itemsFromBackend.length === 0 ? (
                  <div className="w-full sm:w-24 h-24 rounded-lg bg-muted animate-pulse" />
                ) : (
                  <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={(item as MenuItem).image}
                      alt={(item as MenuItem).name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    {isFetching && itemsFromBackend.length === 0 ? (
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold font-serif text-foreground">
                            {(item as MenuItem).name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {(item as MenuItem).description}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-primary whitespace-nowrap">
                          ${((item as MenuItem).price ?? 0).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  {isFetching && itemsFromBackend.length === 0 ? (
                    <div className="flex gap-2">
                      <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-28 bg-muted rounded animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {(item as MenuItem).category}
                      </Badge>
                      <Badge
                        variant={
                          (item as MenuItem).available ? "default" : "secondary"
                        }
                        className={
                          (item as MenuItem).available
                            ? "bg-primary/10 text-primary"
                            : ""
                        }
                      >
                        {(item as MenuItem).available
                          ? "Available"
                          : "Out of Stock"}
                      </Badge>
                    </div>
                  )}

                  {!(isFetching && itemsFromBackend.length === 0) && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditItem(item as MenuItem)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteItem(item as MenuItem)}
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 &&
          !(isFetching && itemsFromBackend.length === 0) && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No items found matching your search"
                  : "No menu items yet"}
              </p>
            </div>
          )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Page {page} of {Math.max(1, totalPages)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
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
