import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navItems = [
    { to: "/products", label: t("layout.nav.products") },
    { to: "/age-groups", label: t("layout.nav.ageGroups") },
    { to: "/product-quantities", label: t("layout.nav.productQuantities") },
    { to: "/recipes", label: t("layout.nav.recipes") },
    { to: "/days", label: t("layout.nav.days") },
    { to: "/orders", label: t("layout.nav.orders") },
  ];

  return (
    <Box>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ flexDirection: "column", alignItems: "stretch", py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <Typography variant="h6">{t("layout.title")}</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={i18n.language === "es" ? "contained" : "outlined"}
                color={i18n.language === "es" ? "secondary" : "inherit"}
                aria-label={t("language.es")}
                onClick={() => {
                  void i18n.changeLanguage("es");
                }}
              >
                🇪🇸
              </Button>
              <Button
                size="small"
                variant={i18n.language === "en" ? "contained" : "outlined"}
                color={i18n.language === "en" ? "secondary" : "inherit"}
                aria-label={t("language.en")}
                onClick={() => {
                  void i18n.changeLanguage("en");
                }}
              >
                🇺🇸
              </Button>
            </Stack>
          </Box>
          <Typography variant="body2">{t("layout.subtitle")}</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  variant={active ? "contained" : "outlined"}
                  color={active ? "secondary" : "inherit"}
                  size="small"
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
