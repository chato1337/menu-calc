import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

interface CrudFormActionsProps {
  editing: boolean;
  onCancel?: () => void;
}

export function CrudFormActions({ editing, onCancel }: CrudFormActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button variant="contained" type="submit">
        {editing ? t("common.update") : t("common.create")}
      </Button>
      {editing && onCancel ? (
        <Button type="button" variant="outlined" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      ) : null}
    </>
  );
}
