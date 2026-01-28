"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useAuth } from "@/contexts/AuthContext";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
} from "@/components/icons";

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <p className="font-bold text-inherit">Task Manager</p>
          </NextLink>
        </NavbarBrand>
        {isAuthenticated && (
          <ul className="hidden lg:flex gap-4 justify-start ml-2">
            {siteConfig.navItems
              .filter((item) => item.href !== "/login")
              .map((item) => (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-primary data-[active=true]:font-medium",
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ))}
          </ul>
        )}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {isAuthenticated ? (
          <>
            <NavbarItem className="hidden sm:flex gap-2">
              <ThemeSwitch />
            </NavbarItem>
            <NavbarItem>
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-600">
                  {user?.username}
                </span>
                <Button
                  color="danger"
                  variant="light"
                  size="sm"
                  onPress={handleLogout}
                >
                  Salir
                </Button>
              </div>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden sm:flex gap-2">
              <ThemeSwitch />
            </NavbarItem>
            <NavbarItem>
              <Button
                as={NextLink}
                color="primary"
                href="/login"
                variant="flat"
              >
                Iniciar Sesión
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {isAuthenticated && <NavbarMenuToggle />}
      </NavbarContent>

      {isAuthenticated && (
        <NavbarMenu>
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navItems
              .filter((item) => item.href !== "/login")
              .map((item, index) => (
                <NavbarMenuItem key={`${item.href}-${index}`}>
                  <Link
                    color="foreground"
                    href={item.href}
                    size="lg"
                    as={NextLink}
                  >
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              ))}
            <NavbarMenuItem>
              <div className="flex items-center justify-between w-full">
                <span className="text-default-600">{user?.username}</span>
                <Button
                  color="danger"
                  variant="light"
                  size="sm"
                  onPress={handleLogout}
                >
                  Salir
                </Button>
              </div>
            </NavbarMenuItem>
          </div>
        </NavbarMenu>
      )}
    </HeroUINavbar>
  );
};
