import { FormEvent, UIEvent, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  listAgeGroups,
  createProductQuantity,
  deleteProductQuantity,
  listProductQuantities,
  listProducts,
  updateProductQuantity,
} from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { AgeGroupSelector } from "../components/AgeGroupSelector";
import { CrudFormActions } from "../components/CrudFormActions";
import { FOOD_UNIT_OPTIONS } from "../constants/units";
import { PaginationControls } from "../components/PaginationControls";
import { Product, ProductQuantity, ProductQuantityPayload } from "../types/domain";

const LIMIT = 10;
const PRODUCT_SEARCH_LIMIT = 20;

export function ProductQuantitiesPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<ProductQuantity | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");
  const [form, setForm] = useState<ProductQuantityPayload>({
    product: 0,
    age_groups: [],
    unit_of_measure: "",
    quantity: "",
    package_type: "",
  });

  const queryKey = useMemo(() => ["product-quantities", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listProductQuantities({ limit: LIMIT, offset }),
  });

  const {
    data: productPages,
    isLoading: isLoadingProducts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", "quantity-selector", debouncedSearchInput],
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
  const { data: ageGroups, isLoading: isLoadingAgeGroups } = useQuery({
    queryKey: ["age-groups", "selector"],
    queryFn: () => listAgeGroups({ limit: 200, offset: 0 }),
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

  const selectedProduct = useMemo(
    () =>
      productOptions.find((item) => item.id === form.product) ??
      (form.product > 0
        ? {
            id: form.product,
            name: t("productQuantitiesPage.productFallback", { id: form.product }),
            category: "",
            quantities: [],
          }
        : null),
    [productOptions, form.product, t]
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["product-quantities"] });
  };
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const createMutation = useMutation({
    mutationFn: (payload: ProductQuantityPayload) => createProductQuantity(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductQuantityPayload }) =>
      updateProductQuantity(id, payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async () => {
      resetForm();
      await refresh();
      showSnackbar(t("notifications.updated"), "success");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProductQuantity(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
      return;
    }
    createMutation.mutate(form, {
      onSuccess: () => {
        resetForm();
        showSnackbar(t("notifications.created"), "success");
      },
    });
  }

  function startEdit(item: ProductQuantity) {
    setEditing(item);
    setSearchInput("");
    setDebouncedSearchInput("");
    setForm({
      product: item.product,
      age_groups: item.age_groups,
      unit_of_measure: item.unit_of_measure,
      quantity: item.quantity,
      package_type: item.package_type,
    });
  }

  function resetForm() {
    setEditing(null);
    setSearchInput("");
    setDebouncedSearchInput("");
    setForm({
      product: 0,
      age_groups: [],
      unit_of_measure: "",
      quantity: "",
      package_type: "",
    });
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
      <Typography variant="h5">{t("productQuantitiesPage.title")}</Typography>
      <Stack component="form" onSubmit={onSubmit} direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Autocomplete
          sx={{ minWidth: { xs: "100%", sm: 260 } }}
          options={productOptions}
          value={selectedProduct}
          loading={isLoadingProducts || isFetchingNextPage}
          filterOptions={(options) => options}
          getOptionLabel={(option) => `${option.name} (#${option.id})`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, value) => setForm((prev) => ({ ...prev, product: value?.id ?? 0 }))}
          onInputChange={(_, value, reason) => {
            if (reason === "input" || reason === "clear") {
              setSearchInput(value);
            }
          }}
          ListboxProps={{ onScroll: onProductListScroll }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={t("productQuantitiesPage.productLabel")}
              placeholder={t("productQuantitiesPage.productSearchPlaceholder")}
              required
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
        <AgeGroupSelector
          options={ageGroups?.results ?? []}
          selectedIds={form.age_groups}
          loading={isLoadingAgeGroups}
          onChange={(ids) => setForm((prev) => ({ ...prev, age_groups: ids }))}
        />
        <TextField
          select
          size="small"
          value={form.unit_of_measure}
          onChange={(e) => setForm((prev) => ({ ...prev, unit_of_measure: e.target.value }))}
          label={t("common.unit")}
          required
          sx={{ minWidth: { xs: "100%", sm: 220 } }}
        >
          <MenuItem value="" disabled>
            {t("units.selectUnit")}
          </MenuItem>
          {FOOD_UNIT_OPTIONS.map((unit) => (
            <MenuItem key={unit.value} value={unit.value}>
              {t(unit.labelKey)}
            </MenuItem>
          ))}
          {form.unit_of_measure && !FOOD_UNIT_OPTIONS.some((unit) => unit.value === form.unit_of_measure) ? (
            <MenuItem value={form.unit_of_measure}>{t("categories.current", { value: form.unit_of_measure })}</MenuItem>
          ) : null}
        </TextField>
        <TextField
          size="small"
          value={form.quantity}
          onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
          label={t("productQuantitiesPage.quantityLabel")}
          placeholder={t("productQuantitiesPage.quantityPlaceholder")}
          required
        />
        <TextField
          size="small"
          value={form.package_type}
          onChange={(e) => setForm((prev) => ({ ...prev, package_type: e.target.value }))}
          label={t("productQuantitiesPage.packageTypeLabel")}
          placeholder={t("productQuantitiesPage.packageTypePlaceholder")}
          required
        />
        <CrudFormActions editing={Boolean(editing)} onCancel={resetForm} />
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {t("productQuantitiesPage.selectedProfiles", { count: form.age_groups.length })}
      </Typography>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.product")}</TableCell>
              <TableCell>{t("labels.profiles")}</TableCell>
              <TableCell>{t("common.unit")}</TableCell>
              <TableCell>{t("common.quantity")}</TableCell>
              <TableCell>{t("common.package")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(data?.results ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.product_name || t("productQuantitiesPage.productFallback", { id: item.product })}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                  {(item.age_group_profiles ?? []).length > 0
                    ? item.age_group_profiles.map((profile) => (
                        <Chip key={profile.id} size="small" label={`${profile.name} (${profile.quantity})`} />
                      ))
                    : item.age_groups.map((id) => (
                        <Chip key={id} size="small" label={t("productQuantitiesPage.profileFallback", { id })} />
                      ))}
                </Stack>
              </TableCell>
              <TableCell>{item.unit_of_measure}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.package_type}</TableCell>
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
