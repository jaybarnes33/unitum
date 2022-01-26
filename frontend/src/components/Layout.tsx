import { Suspense, useState } from "react";
import { Theme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);
  const tabletUp = useMediaQuery(({ breakpoints }: Theme) =>
    breakpoints.up("sm")
  );
  const desktopUp = useMediaQuery(({ breakpoints }: Theme) =>
    breakpoints.up("lg")
  );

  const openDrawer = () => setIsDrawerOpened(true);
  const closeDrawer = () => setIsDrawerOpened(false);

  return (
    <>
      <TopBar openDrawer={openDrawer} />
      <Stack direction="row" spacing={4}>
        <Suspense fallback={<div />}>
          <Sidebar open={isDrawerOpened} handleClose={closeDrawer} />
        </Suspense>
        <Container
          disableGutters={desktopUp}
          component="main"
          maxWidth="md"
          sx={{ pt: 11 }}
        >
          {children}
        </Container>
      </Stack>
      {!tabletUp && <BottomNav />}
    </>
  );
};

export default Layout;
