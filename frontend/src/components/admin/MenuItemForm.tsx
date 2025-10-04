import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MenuItem } from "@/types/menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useCategoriesQuery } from "@/hooks/useMenuApi";

const menuItemSchema = z.object({
  // Nested bilingual fields (independent values)
  name: z.object({
    en: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters"),
    am: z.string().trim().optional().default(""),
  }),
  description: z.object({
    en: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(200, "Description must be less than 200 characters"),
    am: z.string().trim().optional().default(""),
  }),
  fullDescription: z.object({
    en: z
      .string()
      .trim()
      .min(1, "Full description is required")
      .max(1000, "Full description must be less than 1000 characters"),
    am: z.string().trim().optional().default(""),
  }),

  category: z.string().min(1, "Category is required"),
  price: z
    .number()
    .positive("Price must be positive")
    .max(9999, "Price too high"),
  ingredients: z.object({
    en: z.string().trim().min(1, "Ingredients are required"),
    am: z.string().trim().optional().default(""),
  }),
  allergens: z.object({
    en: z.string().trim().optional().default(""),
    am: z.string().trim().optional().default(""),
  }),
  prepTime: z.string().trim().min(1, "Prep time is required"),
  portionSize: z.string().trim().min(1, "Portion size is required"),
  available: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
}

export const MenuItemForm = ({
  item,
  onSubmit,
  onCancel,
}: MenuItemFormProps) => {
  const [imagePreview, setImagePreview] = useState<string>(item?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { t, i18n } = useTranslation();
  const { data: categories } = useCategoriesQuery();
  const initialLang = (i18n.language || "en").startsWith("am") ? "am" : "en";
  const [langTab, setLangTab] = useState<"en" | "am">(
    initialLang as "en" | "am"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item
      ? {
          // Prefill only the active language from server localized values
          name: {
            en: initialLang === "en" ? item.name : "",
            am: initialLang === "am" ? item.name : "",
          },
          description: {
            en: initialLang === "en" ? item.description : "",
            am: initialLang === "am" ? item.description : "",
          },
          fullDescription: {
            en: initialLang === "en" ? item.fullDescription : "",
            am: initialLang === "am" ? item.fullDescription : "",
          },
          category: item.category,
          price: item.price,
          ingredients: {
            en: initialLang === "en" ? item.ingredients.join(", ") : "",
            am: initialLang === "am" ? item.ingredients.join(", ") : "",
          },
          allergens: {
            en: initialLang === "en" ? item.allergens.join(", ") : "",
            am: initialLang === "am" ? item.allergens.join(", ") : "",
          },
          prepTime: item.prepTime,
          portionSize: item.portionSize,
          available: item.available,
        }
      : {
          name: { en: "", am: "" },
          description: { en: "", am: "" },
          fullDescription: { en: "", am: "" },
          ingredients: { en: "", am: "" },
          allergens: { en: "", am: "" },
          category: "",
          // allow empty then enforce via validation on submit
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          price: undefined as any,
          prepTime: "",
          portionSize: "",
          available: true,
        },
  });

  const available = watch("available");

  // Switching tabs should never copy or clear values; each language keeps its own value.
  const handleLangTabChange = (next: "en" | "am") => setLangTab(next);

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
    const splitList = (s: string) =>
      (s || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const payload = {
      name: { en: data.name.en, am: data.name.am || "" },
      description: { en: data.description.en, am: data.description.am || "" },
      fullDescription: {
        en: data.fullDescription.en,
        am: data.fullDescription.am || "",
      },
      category: data.category,
      price: data.price,
      ingredients: {
        en: splitList(data.ingredients.en),
        am: splitList(data.ingredients.am),
      },
      allergens: {
        en: splitList(data.allergens.en),
        am: splitList(data.allergens.am),
      },
      prepTime: data.prepTime,
      portionSize: data.portionSize,
      available: data.available,
      image:
        imagePreview ||
        item?.image ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
      uiName: (i18n.language || "en").startsWith("am")
        ? data.name.am || data.name.en
        : data.name.en,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>{t("menuMgmt.labels.image")}</Label>
        <div className="flex gap-4 items-start">
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview("");
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
              <span className="text-sm text-muted-foreground">
                {t("menuMgmt.labels.upload")}
              </span>
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

      {/* Localized Name & Descriptions */}
      <Tabs
        value={langTab}
        onValueChange={(v) => handleLangTabChange(v as "en" | "am")}
      >
        <TabsList>
          <TabsTrigger value="en">{t("menuMgmt.lang_tab.en")}</TabsTrigger>
          <TabsTrigger value="am">{t("menuMgmt.lang_tab.am")}</TabsTrigger>
        </TabsList>
        <TabsContent value="en">
          <div className="space-y-2">
            <Label htmlFor="nameEn">{t("menuMgmt.labels.name")}</Label>
            <Input
              id="nameEn"
              {...register("name.en")}
              placeholder={t("menuMgmt.labels.placeholders.name")}
              className={errors.name?.en ? "border-destructive" : ""}
            />
            {errors.name?.en && (
              <p className="text-xs text-destructive">
                {errors.name.en.message as string}
              </p>
            )}
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="descriptionEn">
              {t("menuMgmt.labels.shortDesc")}
            </Label>
            <Textarea
              id="descriptionEn"
              {...register("description.en")}
              placeholder={t("menuMgmt.labels.placeholders.shortDesc")}
              rows={2}
              className={errors.description?.en ? "border-destructive" : ""}
            />
            {errors.description?.en && (
              <p className="text-xs text-destructive">
                {errors.description.en.message as string}
              </p>
            )}
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="fullDescriptionEn">
              {t("menuMgmt.labels.fullDesc")}
            </Label>
            <Textarea
              id="fullDescriptionEn"
              {...register("fullDescription.en")}
              placeholder={t("menuMgmt.labels.placeholders.fullDesc")}
              rows={4}
              className={errors.fullDescription?.en ? "border-destructive" : ""}
            />
            {errors.fullDescription?.en && (
              <p className="text-xs text-destructive">
                {errors.fullDescription.en.message as string}
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="am">
          <div className="space-y-2">
            <Label htmlFor="nameAm">{t("menuMgmt.labels.name")}</Label>
            <Input
              id="nameAm"
              {...register("name.am")}
              placeholder={t("menuMgmt.labels.placeholders.name")}
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="descriptionAm">
              {t("menuMgmt.labels.shortDesc")}
            </Label>
            <Textarea
              id="descriptionAm"
              {...register("description.am")}
              placeholder={t("menuMgmt.labels.placeholders.shortDesc")}
              rows={2}
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="fullDescriptionAm">
              {t("menuMgmt.labels.fullDesc")}
            </Label>
            <Textarea
              id="fullDescriptionAm"
              {...register("fullDescription.am")}
              placeholder={t("menuMgmt.labels.placeholders.fullDesc")}
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">{t("menuMgmt.labels.category")}</Label>
          <Select
            defaultValue={item?.category}
            onValueChange={(value) => setValue("category", value)}
          >
            <SelectTrigger
              className={errors.category ? "border-destructive" : ""}
            >
              <SelectValue placeholder={t("menuMgmt.labels.select_category")} />
            </SelectTrigger>
            <SelectContent>
              {(
                categories ?? [
                  "Starters",
                  "Main Course",
                  "Desserts",
                  "Drinks",
                  "Specials",
                ]
              ).map((c) => {
                const label = t(`menuMgmt.categories_values.${c}`, {
                  defaultValue: c,
                });
                return (
                  <SelectItem key={c} value={c}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {/* Price, Prep Time, Portion Size */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("menuMgmt.labels.price")}</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            placeholder={t("menuMgmt.labels.placeholders.price")}
            className={errors.price ? "border-destructive" : ""}
          />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prepTime">{t("menuMgmt.labels.prepTime")}</Label>
          <Input
            id="prepTime"
            {...register("prepTime")}
            placeholder={t("menuMgmt.labels.placeholders.prepTime")}
            className={errors.prepTime ? "border-destructive" : ""}
          />
          {errors.prepTime && (
            <p className="text-xs text-destructive">
              {errors.prepTime.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="portionSize">
            {t("menuMgmt.labels.portionSize")}
          </Label>
          <Input
            id="portionSize"
            {...register("portionSize")}
            placeholder={t("menuMgmt.labels.placeholders.portionSize")}
            className={errors.portionSize ? "border-destructive" : ""}
          />
          {errors.portionSize && (
            <p className="text-xs text-destructive">
              {errors.portionSize.message}
            </p>
          )}
        </div>
      </div>

      {/* Ingredients bilingual */}
      <Tabs
        value={langTab}
        onValueChange={(v) => handleLangTabChange(v as "en" | "am")}
      >
        <TabsList>
          <TabsTrigger value="en">{t("menuMgmt.lang_tab.en")}</TabsTrigger>
          <TabsTrigger value="am">{t("menuMgmt.lang_tab.am")}</TabsTrigger>
        </TabsList>
        <TabsContent value="en">
          <div className="space-y-2">
            <Label htmlFor="ingredients">
              {t("menuMgmt.labels.ingredients")}
            </Label>
            <Textarea
              id="ingredients"
              {...register("ingredients.en")}
              placeholder={t("menuMgmt.labels.placeholders.ingredients")}
              rows={3}
              className={errors.ingredients?.en ? "border-destructive" : ""}
            />
            {errors.ingredients?.en && (
              <p className="text-xs text-destructive">
                {errors.ingredients.en.message as string}
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="am">
          <div className="space-y-2">
            <Label htmlFor="ingredientsAm">
              {t("menuMgmt.labels.ingredients")}
            </Label>
            <Textarea
              id="ingredientsAm"
              {...register("ingredients.am")}
              placeholder={t("menuMgmt.labels.placeholders.ingredients")}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Allergens bilingual */}
      <Tabs
        value={langTab}
        onValueChange={(v) => handleLangTabChange(v as "en" | "am")}
      >
        <TabsList>
          <TabsTrigger value="en">{t("menuMgmt.lang_tab.en")}</TabsTrigger>
          <TabsTrigger value="am">{t("menuMgmt.lang_tab.am")}</TabsTrigger>
        </TabsList>
        <TabsContent value="en">
          <div className="space-y-2">
            <Label htmlFor="allergens">{t("menuMgmt.labels.allergens")}</Label>
            <Textarea
              id="allergens"
              {...register("allergens.en")}
              placeholder={t("menuMgmt.labels.placeholders.allergens")}
              rows={3}
            />
          </div>
        </TabsContent>
        <TabsContent value="am">
          <div className="space-y-2">
            <Label htmlFor="allergensAm">
              {t("menuMgmt.labels.allergens")}
            </Label>
            <Textarea
              id="allergensAm"
              {...register("allergens.am")}
              placeholder={t("menuMgmt.labels.placeholders.allergens")}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Availability Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
        <div className="space-y-0.5">
          <Label htmlFor="available" className="text-base font-semibold">
            {t("menuMgmt.labels.availability")}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t("menuMgmt.labels.availability_hint")}
          </p>
        </div>
        <Switch
          id="available"
          checked={available}
          onCheckedChange={(checked) => setValue("available", checked)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {item ? t("menuMgmt.update_item") : t("menuMgmt.add_item")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          {t("menuMgmt.actions.cancel")}
        </Button>
      </div>
    </form>
  );
};
