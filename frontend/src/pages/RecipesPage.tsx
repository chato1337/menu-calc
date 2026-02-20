import { FormEvent, UIEvent, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { createRecipe, deleteRecipe, listProducts, listRecipes, updateRecipe } from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { PaginationControls } from "../components/PaginationControls";
import { Product, Recipe, RecipePayload } from "../types/domain";

const LIMIT = 10;
const PRODUCT_SEARCH_LIMIT = 20;

export function RecipesPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [name, setName] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");

  const queryKey = useMemo(() => ["recipes", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listRecipes({ limit: LIMIT, offset }),
  });

  const {
    data: productPages,
    isLoading: isLoadingProducts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "recipe-selector", debouncedSearchInput],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listProducts({
        limit: PRODUCT_SEARCH_LIMIT,
        offset: pageParam,
        search: debouncedSearchInput,
      }),
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce((sum, page) => sum + page.results.length, 0);
      return loadedCount < lastPage.count ? loadedCount : undefined;
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const productOptions = useMemo(() => {
    const map = new Map<number, Product>();
    for (const page of productPages?.pages ?? []) {
      for (const product of page.results) {
        map.set(product.id, product);
      }
    }
    return Array.from(map.values());
  }, [productPages]);

  const selectedProducts = useMemo(() => {
    const map = new Map(productOptions.map((item) => [item.id, item]));
    return selectedProductIds.map((id) => ({
      id,
      name: map.get(id)?.name ?? t("recipesPage.productFallback", { id }),
      category: "",
      quantities: [],
    }));
  }, [productOptions, selectedProductIds, t]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["recipes"] });
  };
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const createMutation = useMutation({
    mutationFn: (payload: RecipePayload) => createRecipe(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RecipePayload }) => updateRecipe(id, payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async () => {
      setEditing(null);
      await refresh();
      showSnackbar(t("notifications.updated"), "success");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: RecipePayload = {
      name: name.trim(),
      products: selectedProductIds,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        showSnackbar(t("notifications.created"), "success");
      },
    });
  }

  function startEdit(item: Recipe) {
    setEditing(item);
    setName(item.name);
    setSelectedProductIds(item.products);
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setSelectedProductIds([]);
    setSearchInput("");
    setDebouncedSearchInput("");
  }

  function onProductListScroll(event: UIEvent<HTMLUListElement>) {
    const target = event.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
    if (reachedBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("recipesPage.title")}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t("recipesPage.description")}
      </Typography>
      <Stack component="form" onSubmit={onSubmit} direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <TextField size="small" value={name} onChange={(e) => setName(e.target.value)} label={t("common.name")} required />
        <Autocomplete
          multiple
          sx={{ minWidth: 360 }}
          options={productOptions}
          value={selectedProducts}
          loading={isLoadingProducts || isFetchingNextPage}
          filterOptions={(options) => options}
          getOptionLabel={(option) => `${option.name} (#${option.id})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value, reason) => {
            setSelectedProductIds(value.map((item) => item.id));
            if (reason === "selectOption") {
              setSearchInput("");
              setDebouncedSearchInput("");
            }
          }}
          inputValue={searchInput}
          onInputChange={(_, value, reason) => {
            if (reason === "input" || reason === "clear") {
              setSearchInput(value);
            }
          }}
          ListboxProps={{ onScroll: onProductListScroll }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                label={`${option.name || t("common.product")} (#${option.id})`}
                size="small"
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={t("recipesPage.productsLabel")}
              placeholder={t("recipesPage.productSearchPlaceholder")}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoadingProducts || isFetchingNextPage ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Button variant="contained" type="submit">
          {editing ? t("common.update") : t("common.create")}
        </Button>
        {editing ? (
          <Button type="button" variant="outlined" onClick={resetForm}>
            {t("common.cancel")}
          </Button>
        ) : null}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t("recipesPage.selectedProducts", { count: selectedProductIds.length })}
      </Typography>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.products")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(data?.results ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {(item.product_details ?? []).length > 0
                  ? item.product_details.map((product) => product.name).join(", ")
                  : item.products.join(", ")}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => startEdit(item)}>
                    {t("common.edit")}
                  </Button>
                  <Button size="small" color="error" onClick={() => deleteMutation.mutate(item.id)}>
                    {t("common.delete")}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </Paper>

      <PaginationControls
        total={data?.count ?? 0}
        limit={LIMIT}
        offset={offset}
        onPrev={() => setOffset((prev) => Math.max(0, prev - LIMIT))}
        onNext={() => setOffset((prev) => prev + LIMIT)}
      />
    </Stack>
  );
}
