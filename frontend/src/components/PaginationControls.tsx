import { Button, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface PaginationControlsProps {
  total: number;
  limit: number;
  offset: number;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationControls({
  total,
  limit,
  offset,
  onPrev,
  onNext,
}: PaginationControlsProps) {
  const { t } = useTranslation();
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + limit, total);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1 }}
    >
      <Typography variant="body2">
        {t("pagination.showing", { start, end, total })}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button onClick={onPrev} disabled={offset === 0} variant="outlined" size="small">
          {t("common.previous")}
        </Button>
        <Button onClick={onNext} disabled={offset + limit >= total} variant="outlined" size="small">
          {t("common.next")}
        </Button>
      </Stack>
    </Stack>
  );
}
