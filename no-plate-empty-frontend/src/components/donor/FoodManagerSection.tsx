import { useEffect, useState } from "react";
import {
  PackageOpen,
  PencilLine,
  RefreshCw,
  Store,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/auth";
import {
  Category,
  DonorEntry,
  FoodItem,
  createFood,
  deleteFood,
  getCategories,
  getMyDonorEntries,
  getMyFoods,
  updateFood,
} from "@/lib/feature-api";

const EMPTY_FOOD_FORM = {
  outletId: "",
  title: "",
  description: "",
  imageUrl: "",
  foodTags: "",
  category: "",
  code: "",
  expireTime: "",
  isAvailable: true,
};

const formatDateTimeInput = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const formatDisplayDate = (value?: string) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getOutletId = (food: FoodItem) => {
  if (!food.Doner) {
    return "";
  }

  return typeof food.Doner === "string" ? food.Doner : food.Doner._id || "";
};

const getOutletTitle = (food: FoodItem) => {
  if (!food.Doner) {
    return "Unknown outlet";
  }

  if (typeof food.Doner === "string") {
    return food.Doner;
  }

  return food.Doner.title || food.Doner.location?.title || "Unnamed outlet";
};

const FoodManagerSection = () => {
  const { token, user } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [outlets, setOutlets] = useState<DonorEntry[]>([]);
  const [form, setForm] = useState(EMPTY_FOOD_FORM);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFoodId, setPendingFoodId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = async (showRefreshState = false) => {
    if (!token) {
      return;
    }

    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [foodsResponse, categoriesResponse, outletsResponse] = await Promise.all([
        getMyFoods(token),
        getCategories(),
        getMyDonorEntries(token),
      ]);

      setFoods(Array.isArray(foodsResponse.foods) ? foodsResponse.foods : []);
      setCategories(
        Array.isArray(categoriesResponse.categories)
          ? categoriesResponse.categories
          : [],
      );
      setOutlets(
        Array.isArray(outletsResponse.Doners) ? outletsResponse.Doners : [],
      );
      setMessage(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to load donor foods and outlets."),
      });
    } finally {
      if (showRefreshState) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    void loadData();
  }, [token, user?._id]);

  if (!token || !user) {
    return (
      <Card className="border-border/60 bg-background/92 shadow-lg">
        <CardContent className="py-10 text-sm text-muted-foreground">
          Your donor session is loading. Open the food tab again in a moment.
        </CardContent>
      </Card>
    );
  }

  const resetForm = () => {
    setEditingFoodId(null);
    setForm(EMPTY_FOOD_FORM);
  };

  const validateForm = () => {
    if (!form.outletId.trim()) {
      return "Choose the outlet that owns this food.";
    }

    if (!form.title.trim()) {
      return "Food title is required.";
    }

    if (!form.description.trim()) {
      return "Food description is required.";
    }

    if (!form.category.trim()) {
      return "Category is required.";
    }

    if (!form.code.trim()) {
      return "Food code is required.";
    }

    return null;
  };

  const handleSave = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setMessage({ type: "error", text: validationMessage });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    const payload = {
      outlet: form.outletId,
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      foodTags: form.foodTags.trim() || undefined,
      category: form.category.trim(),
      code: form.code.trim(),
      isAvailable: form.isAvailable,
      expireTime: form.expireTime
        ? new Date(form.expireTime).toISOString()
        : undefined,
    };

    try {
      if (editingFoodId) {
        const response = await updateFood(token, editingFoodId, payload);
        setFoods((currentFoods) =>
          currentFoods.map((food) =>
            food._id === editingFoodId ? response.food : food,
          ),
        );
        setMessage({ type: "success", text: "Food updated successfully." });
      } else {
        const response = await createFood(token, payload);
        setFoods((currentFoods) => [response.food, ...currentFoods]);
        setMessage({ type: "success", text: "Food created successfully." });
      }

      resetForm();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to save food."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (food: FoodItem) => {
    setEditingFoodId(food._id);
    setForm({
      outletId: getOutletId(food),
      title: food.title || "",
      description: food.decription || "",
      imageUrl: food.imageUrl || "",
      foodTags: food.foodTags || "",
      category: food.catagory || "",
      code: food.code || "",
      expireTime: formatDateTimeInput(food.expireTime),
      isAvailable: Boolean(food.isAvailable),
    });
    setMessage(null);
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    setPendingFoodId(food._id);
    setMessage(null);

    try {
      const response = await updateFood(token, food._id, {
        isAvailable: !food.isAvailable,
      });
      setFoods((currentFoods) =>
        currentFoods.map((currentFood) =>
          currentFood._id === food._id ? response.food : currentFood,
        ),
      );
      setMessage({ type: "success", text: "Food availability updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to update food availability."),
      });
    } finally {
      setPendingFoodId(null);
    }
  };

  const handleDelete = async (foodId: string) => {
    setPendingFoodId(foodId);
    setMessage(null);

    try {
      await deleteFood(token, foodId);
      setFoods((currentFoods) =>
        currentFoods.filter((food) => food._id !== foodId),
      );
      if (editingFoodId === foodId) {
        resetForm();
      }
      setMessage({ type: "success", text: "Food deleted successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to delete food."),
      });
    } finally {
      setPendingFoodId(null);
    }
  };

  const selectedOutlet = outlets.find((outlet) => outlet._id === form.outletId);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card className="border-border/60 bg-background/92 shadow-lg">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-primary" />
              {editingFoodId ? "Edit Food" : "Create Food"}
            </CardTitle>
            <CardDescription>
              Each food now belongs to one donor outlet. Choose the outlet first,
              then save the food under that outlet.
            </CardDescription>
          </div>

          {message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {outlets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              Create a donor outlet in the Donor Details tab before adding food.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Outlet</Label>
                <div className="flex flex-wrap gap-2">
                  {outlets.map((outlet) => (
                    <Button
                      key={outlet._id}
                      type="button"
                      variant={form.outletId === outlet._id ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setForm((current) => ({ ...current, outletId: outlet._id }))
                      }
                    >
                      <Store className="mr-2 h-4 w-4" />
                      {outlet.title}
                    </Button>
                  ))}
                </div>
                {selectedOutlet && (
                  <p className="text-sm text-muted-foreground">
                    Pickup from:{" "}
                    {selectedOutlet.location?.address || "No address saved"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="food-title">Food Title</Label>
                <Input
                  id="food-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Veg Meal Pack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="food-description">Description</Label>
                <Textarea
                  id="food-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Fresh cooked veg meal"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="food-category">Category</Label>
                  <Input
                    id="food-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    placeholder={categories[0]?.title || "Vegetarian"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food-code">Food Code</Label>
                  <Input
                    id="food-code"
                    value={form.code}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, code: event.target.value }))
                    }
                    placeholder="FOOD1001"
                  />
                </div>
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Available Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category._id}
                        type="button"
                        variant={
                          form.category === category.title ? "secondary" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            category: category.title,
                          }))
                        }
                      >
                        {category.title}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="food-image">Image URL</Label>
                  <Input
                    id="food-image"
                    value={form.imageUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    placeholder="https://example.com/food.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food-tags">Food Tags</Label>
                  <Input
                    id="food-tags"
                    value={form.foodTags}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        foodTags: event.target.value,
                      }))
                    }
                    placeholder="meal, rice, bread"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="food-expire-time">Expire Time</Label>
                  <Input
                    id="food-expire-time"
                    type="datetime-local"
                    value={form.expireTime}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        expireTime: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={form.isAvailable ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setForm((current) => ({ ...current, isAvailable: true }))
                      }
                    >
                      Available
                    </Button>
                    <Button
                      type="button"
                      variant={!form.isAvailable ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setForm((current) => ({ ...current, isAvailable: false }))
                      }
                    >
                      Unavailable
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving
                    ? "Saving..."
                    : editingFoodId
                      ? "Update Food"
                      : "Create Food"}
                </Button>
                {editingFoodId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/92 shadow-lg">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Your Foods</CardTitle>
            <CardDescription>
              These foods are grouped under the donor outlets owned by your
              account.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => void loadData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading donor foods...</p>
          ) : foods.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
              No foods found for your outlets yet. Create your first food item here.
            </p>
          ) : (
            foods.map((food) => (
              <div
                key={food._id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">
                        {food.title}
                      </p>
                      <Badge variant={food.isAvailable ? "secondary" : "outline"}>
                        {food.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                      <Badge variant="outline">{getOutletTitle(food)}</Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {food.decription || "No description saved"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {food.catagory && <span>Category: {food.catagory}</span>}
                      {food.code && <span>Code: {food.code}</span>}
                      <span>Expires: {formatDisplayDate(food.expireTime)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(food)}
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleToggleAvailability(food)}
                      disabled={pendingFoodId === food._id}
                    >
                      {food.isAvailable ? "Mark Unavailable" : "Mark Available"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleDelete(food._id)}
                      disabled={pendingFoodId === food._id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodManagerSection;
