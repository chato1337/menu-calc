import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
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

import { createProduct, deleteProduct, listProducts, updateProduct } from "../api/entities";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { PaginationControls } from "../components/PaginationControls";
import { Product, ProductPayload } from "../types/domain";

const LIMIT = 10;
export function ProductsPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const CATEGORY_OPTIONS = [
    { value: "perecederos", label: t("categories.perishables") },
    { value: "no perecederos", label: t("categories.nonPerishables") },
  ];

  const queryKey = useMemo(() => ["products", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => listProducts({ limit: LIMIT, offset }),
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  };
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const createMutation = useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) => updateProduct(id, payload),
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
    mutationFn: (id: number) => deleteProduct(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: refresh,
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: ProductPayload = { name: name.trim(), category: category.trim() };
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

  function startEdit(item: Product) {
    setEditing(item);
    setName(item.name);
    setCategory(item.category);
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setCategory("");
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("productsPage.title")}</Typography>
      <Stack component="form" onSubmit={onSubmit} direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <TextField
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("productsPage.namePlaceholder")}
          required
        />
        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label={t("productsPage.categoryLabel")}
          required
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="" disabled>
            {t("categories.selectCategory")}
          </MenuItem>
          {CATEGORY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          {category && !CATEGORY_OPTIONS.some((option) => option.value === category) ? (
            <MenuItem value={category}>{t("categories.current", { value: category })}</MenuItem>
          ) : null}
        </TextField>
        <Button variant="contained" type="submit">
          {editing ? t("common.update") : t("common.create")}
        </Button>
        {editing ? (
          <Button variant="outlined" type="button" onClick={resetForm}>
            {t("common.cancel")}
          </Button>
        ) : null}
      </Stack>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.category")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(data?.results ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
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
