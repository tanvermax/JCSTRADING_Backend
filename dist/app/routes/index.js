"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const OrderCart_route_1 = require("./../modules/order/OrderCart.route");
const express_1 = require("express");
const auth_routs_1 = require("../modules/auth/auth.routs");
const user_route_1 = require("../modules/user/user.route");
const transaction_route_1 = require("../modules/transaction/transaction.route");
const agent_route_1 = require("../modules/agent/agent.route");
const admin_routs_1 = require("../modules/admin/admin.routs");
const product_route_1 = require("../modules/product/product.route");
const otp_routs_1 = require("../modules/otp/otp.routs");
const sku_route_1 = require("../modules/sku/sku.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/agent",
        route: agent_route_1.AgentRouter
    },
    {
        path: "/auth",
        route: auth_routs_1.AuthRoute
    },
    {
        path: "/transaction",
        route: transaction_route_1.TransactionRoute
    },
    {
        path: "/admin",
        route: admin_routs_1.AdminRouter
    },
    {
        path: "/product",
        route: product_route_1.ProductRoute
    },
    {
        path: "/otp",
        route: otp_routs_1.OtpRouter
    },
    {
        path: "/sku",
        route: sku_route_1.SkuRouter
    },
    {
        path: "/order",
        route: OrderCart_route_1.OrderRoute
    }
];
moduleRoutes.forEach((route) => {
    {
        exports.router.use(route.path, route.route);
    }
});
