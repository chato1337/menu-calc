import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
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

import { deleteOrder, getDaysForSelection, generateOrder, getOrders } from "../api/orders";
import { useAppSnackbar } from "../components/AppSnackbarProvider";
import { PaginationControls } from "../components/PaginationControls";
import { GenerateOrderPayload, Order } from "../types/domain";

const LIMIT = 10;

export function OrdersPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useAppSnackbar();
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<GenerateOrderPayload>({
    name: "",
    date: "",
    day_ids: [],
  });

  const queryKey = useMemo(() => ["orders", LIMIT, offset], [offset]);
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getOrders({ limit: LIMIT, offset }),
  });

  const { data: days } = useQuery({
    queryKey: ["days", "selector"],
    queryFn: () => getDaysForSelection(),
  });
  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : t("notifications.genericError"));

  const generateMutation = useMutation({
    mutationFn: (payload: GenerateOrderPayload) => generateOrder(payload),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSnackbar(t("notifications.orderGenerated"), "success");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onError: (error) => {
      showSnackbar(getErrorMessage(error), "error");
    },
    onSuccess: async (_, deletedOrderId) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrder((prev) => (prev?.id === deletedOrderId ? null : prev));
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    generateMutation.mutate(form);
  }

  function toggleDay(dayId: number) {
    setForm((prev) => ({
      ...prev,
      day_ids: prev.day_ids.includes(dayId)
        ? prev.day_ids.filter((id) => id !== dayId)
        : [...prev.day_ids, dayId],
    }));
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{t("ordersPage.title")}</Typography>

      <Stack component="form" onSubmit={onSubmit} spacing={1.5}>
        <TextField
          size="small"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          label={t("ordersPage.orderName")}
          placeholder={t("ordersPage.orderNamePlaceholder")}
          required
        />
        <TextField
          size="small"
          type="date"
          value={form.date}
          onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          label={t("common.date")}
          InputLabelProps={{ shrink: true }}
          required
        />
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
          {(days ?? []).map((day) => (
            <FormControlLabel
              key={day.id}
              control={
                <Checkbox
                checked={form.day_ids.includes(day.id)}
                onChange={() => toggleDay(day.id)}
                />
              }
              label={day.name}
            />
          ))}
        </Stack>
        <Button type="submit" variant="contained" disabled={generateMutation.isPending}>
          {generateMutation.isPending ? t("ordersPage.generating") : t("ordersPage.generateOrder")}
        </Button>
      </Stack>

      {error instanceof Error ? <Alert severity="error">{error.message}</Alert> : null}
      {isLoading ? <Typography>{t("common.loading")}</Typography> : null}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("common.id")}</TableCell>
              <TableCell>{t("common.name")}</TableCell>
              <TableCell>{t("common.date")}</TableCell>
              <TableCell>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {(data?.results ?? []).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => setSelectedOrder(item)}>
                    {t("ordersPage.viewDetail")}
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {t("common.delete")}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="lg">
        <DialogTitle>
          {selectedOrder
            ? t("ordersPage.orderDetailWithName", { name: selectedOrder.name })
            : t("ordersPage.orderDetailTitle")}
        </DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("common.product")}</TableCell>
                <TableCell>{t("common.quantity")}</TableCell>
                <TableCell>{t("ordersPage.packageQuantity")}</TableCell>
                <TableCell>{t("ordersPage.total")}</TableCell>
                <TableCell>{t("ordersPage.detail")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(selectedOrder?.products ?? []).map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {product.quantity} {product.unit_of_measure} ({product.package_type})
                  </TableCell>
                  <TableCell>{product.qty_package}</TableCell>
                  <TableCell>{product.total}</TableCell>
                  <TableCell sx={{ whiteSpace: "pre-line" }}>{product.detail || t("ordersPage.noDetail")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

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
