import { jwtDecode } from "jwt-decode";
import type { IUser } from "~/types/user";

export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    const token = localStorage.getItem("token");

    if (!token) return navigateTo("/login");

    const user = jwtDecode(token) as IUser;

    if (to.path.startsWith("/admin/users") && user.role_id !== 1) {
        return navigateTo("/admin");
    }
});