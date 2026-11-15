"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var common_1 = require("@nestjs/common");
/**
 * Vista enmascarada que se envía a un participante.
 * Cada uno ve su propio auth en detalle y el del otro con asteriscos.
 */
function maskSessionForUser(session, forUserId) {
    var isCreator = session.creator.userId === forUserId;
    return __assign(__assign({}, session), { yourRole: isCreator ? 'creator' : 'joiner' });
}
/* ─── Gateway ─────────────────────────────────── */
var TunnelGateway = function () {
    var _classDecorators = [(0, websockets_1.WebSocketGateway)({
            namespace: '/tunnel',
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:3100',
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _server_decorators;
    var _server_initializers = [];
    var _server_extraInitializers = [];
    var _handleCreate_decorators;
    var _handleJoin_decorators;
    var _handleRequestOtp_decorators;
    var _handleAuthSubmit_decorators;
    var _handleCancel_decorators;
    var TunnelGateway = _classThis = /** @class */ (function () {
        function TunnelGateway_1(authClient, tunnelService) {
            this.authClient = (__runInitializers(this, _instanceExtraInitializers), authClient);
            this.tunnelService = tunnelService;
            this.server = __runInitializers(this, _server_initializers, void 0);
            this.logger = (__runInitializers(this, _server_extraInitializers), new common_1.Logger(TunnelGateway.name));
            /** Map: userId → Set<socketId>  (un usuario puede tener múltiples tabs) */
            this.userSockets = new Map();
            /** Map: socketId → userId */
            this.socketUsers = new Map();
        }
        /* ─── Connection lifecycle ─────────────────── */
        TunnelGateway_1.prototype.handleConnection = function (client) {
            return __awaiter(this, void 0, void 0, function () {
                var token, user;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            token = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) ||
                                ((_c = (_b = client.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.replace('Bearer ', ''));
                            if (!token) {
                                this.logger.warn("Connection rejected: no token (".concat(client.id, ")"));
                                client.emit('error', { message: 'AUTH_REQUIRED' });
                                client.disconnect(true);
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.authClient.validateToken(token)];
                        case 1:
                            user = _d.sent();
                            if (!user) {
                                this.logger.warn("Connection rejected: invalid token (".concat(client.id, ")"));
                                client.emit('error', { message: 'AUTH_INVALID' });
                                client.disconnect(true);
                                return [2 /*return*/];
                            }
                            // Store user info
                            client.data.userId = user.userId;
                            client.data.email = user.email;
                            // Track socket
                            if (!this.userSockets.has(user.userId)) {
                                this.userSockets.set(user.userId, new Set());
                            }
                            this.userSockets.get(user.userId).add(client.id);
                            this.socketUsers.set(client.id, user.userId);
                            this.logger.log("Connected: ".concat(user.userId, " (socket: ").concat(client.id, ")"));
                            client.emit('connected', { userId: user.userId });
                            return [2 /*return*/];
                    }
                });
            });
        };
        TunnelGateway_1.prototype.handleDisconnect = function (client) {
            var userId = this.socketUsers.get(client.id);
            if (userId) {
                var sockets = this.userSockets.get(userId);
                sockets === null || sockets === void 0 ? void 0 : sockets.delete(client.id);
                if ((sockets === null || sockets === void 0 ? void 0 : sockets.size) === 0)
                    this.userSockets.delete(userId);
                this.socketUsers.delete(client.id);
            }
            this.logger.log("Disconnected: ".concat(userId !== null && userId !== void 0 ? userId : 'unknown', " (").concat(client.id, ")"));
        };
        /* ─── Helpers: emit to user ────────────────── */
        TunnelGateway_1.prototype.emitToUser = function (userId, event, data) {
            var sockets = this.userSockets.get(userId);
            if (!sockets)
                return;
            for (var _i = 0, sockets_1 = sockets; _i < sockets_1.length; _i++) {
                var sid = sockets_1[_i];
                this.server.to(sid).emit(event, data);
            }
        };
        TunnelGateway_1.prototype.emitToSession = function (session, event, data) {
            this.emitToUser(session.creator.userId, event, data);
            if (session.joiner) {
                this.emitToUser(session.joiner.userId, event, data);
            }
        };
        TunnelGateway_1.prototype.broadcastSessionState = function (session) {
            // Enviar a cada participante su vista personalizada
            this.emitToUser(session.creator.userId, 'session:state', maskSessionForUser(session, session.creator.userId));
            if (session.joiner) {
                this.emitToUser(session.joiner.userId, 'session:state', maskSessionForUser(session, session.joiner.userId));
            }
        };
        /* ─── Events ───────────────────────────────── */
        /**
         * Cobrador crea una nueva sesión de túnel.
         */
        TunnelGateway_1.prototype.handleCreate = function (client, body) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.tunnelService.createSession({
                                userId: client.data.userId,
                                email: client.data.email,
                                currency: body.currency,
                                amountMinorUnits: body.amountMinorUnits,
                                concept: body.concept,
                                requiredMethods: body.requiredMethods,
                            })];
                        case 1:
                            session = _a.sent();
                            client.data.sessionId = session.sessionId;
                            // Unir al room de la sesión
                            client.join(session.sessionId);
                            client.emit('session:created', maskSessionForUser(session, client.data.userId));
                            this.logger.log("Session created: ".concat(session.sessionId, " invite=").concat(session.inviteCode));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Pagador se une con el código de invitación.
         */
        TunnelGateway_1.prototype.handleJoin = function (client, body) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.tunnelService.joinSession({
                                inviteCode: body.inviteCode,
                                userId: client.data.userId,
                                email: client.data.email,
                            })];
                        case 1:
                            result = _a.sent();
                            if ('error' in result) {
                                client.emit('session:error', { error: result.error });
                                return [2 /*return*/];
                            }
                            client.data.sessionId = result.sessionId;
                            client.join(result.sessionId);
                            // Broadcast a ambos que la sesión está activa
                            this.broadcastSessionState(result);
                            this.emitToSession(result, 'session:joined', {
                                joinedUserId: client.data.userId,
                            });
                            this.logger.log("Session ".concat(result.sessionId, ": ").concat(client.data.userId, " joined"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Solicitar OTP de email (antes de verificarlo).
         */
        TunnelGateway_1.prototype.handleRequestOtp = function (client, body) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.tunnelService.requestEmailOtp(body.sessionId, client.data.userId, client.data.email)];
                        case 1:
                            result = _a.sent();
                            client.emit('auth:otp-requested', result);
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Participante envía un método de autorización.
         * El tunnel lo verifica y broadcast el resultado enmascarado.
         */
        TunnelGateway_1.prototype.handleAuthSubmit = function (client, body) {
            return __awaiter(this, void 0, void 0, function () {
                var result, session, otherUserId;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.tunnelService.verifyAuthMethod({
                                sessionId: body.sessionId,
                                userId: client.data.userId,
                                method: body.method,
                                value: body.value,
                            })];
                        case 1:
                            result = _b.sent();
                            if ('error' in result) {
                                client.emit('auth:error', { error: result.error });
                                return [2 /*return*/];
                            }
                            // Enviar resultado al que envió (detallado)
                            client.emit('auth:result', {
                                method: body.method,
                                verified: result.verified,
                                participantFullyAuthorized: result.participantFullyAuthorized,
                                bothAuthorized: result.bothAuthorized,
                            });
                            return [4 /*yield*/, this.tunnelService.getSession(body.sessionId)];
                        case 2:
                            session = _b.sent();
                            if (!session) return [3 /*break*/, 4];
                            this.broadcastSessionState(session);
                            otherUserId = session.creator.userId === client.data.userId
                                ? (_a = session.joiner) === null || _a === void 0 ? void 0 : _a.userId
                                : session.creator.userId;
                            if (otherUserId) {
                                this.emitToUser(otherUserId, 'auth:partner-update', {
                                    method: body.method,
                                    state: result.verified ? 'verified' : 'failed',
                                    // No se envía el valor real, solo asteriscos
                                    masked: '••••••',
                                });
                            }
                            if (!result.bothAuthorized) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.handleExecuteTransfer(body.sessionId, session)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Ejecutar la transferencia cuando ambos están autorizados.
         */
        TunnelGateway_1.prototype.handleExecuteTransfer = function (sessionId, session) {
            return __awaiter(this, void 0, void 0, function () {
                var result, updatedSession;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Notificar que la transferencia está en proceso
                            this.emitToSession(session, 'transfer:executing', {
                                sessionId: sessionId,
                                status: 'processing',
                            });
                            return [4 /*yield*/, this.tunnelService.executeTransfer(sessionId)];
                        case 1:
                            result = _a.sent();
                            if (!result.success) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.tunnelService.getSession(sessionId)];
                        case 2:
                            updatedSession = _a.sent();
                            if (updatedSession) {
                                this.broadcastSessionState(updatedSession);
                            }
                            this.emitToSession(session, 'transfer:completed', {
                                sessionId: sessionId,
                                txId: result.txId,
                                correlationId: result.correlationId,
                                currency: session.currency,
                                amountMinorUnits: session.amountMinorUnits,
                                concept: session.concept,
                            });
                            this.logger.log("Transfer completed in session ".concat(sessionId));
                            return [3 /*break*/, 4];
                        case 3:
                            this.emitToSession(session, 'transfer:failed', {
                                sessionId: sessionId,
                                reason: result.reason,
                            });
                            this.logger.warn("Transfer failed in session ".concat(sessionId, ": ").concat(result.reason));
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Cancelar una sesión activa.
         */
        TunnelGateway_1.prototype.handleCancel = function (client, body) {
            return __awaiter(this, void 0, void 0, function () {
                var session, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.tunnelService.getSession(body.sessionId)];
                        case 1:
                            session = _a.sent();
                            return [4 /*yield*/, this.tunnelService.cancelSession(body.sessionId, client.data.userId)];
                        case 2:
                            result = _a.sent();
                            if (result.success && session) {
                                this.emitToSession(session, 'session:cancelled', {
                                    sessionId: body.sessionId,
                                    cancelledBy: client.data.userId,
                                });
                            }
                            else {
                                client.emit('session:error', { error: 'CANCEL_FAILED' });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return TunnelGateway_1;
    }());
    __setFunctionName(_classThis, "TunnelGateway");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _server_decorators = [(0, websockets_1.WebSocketServer)()];
        _handleCreate_decorators = [(0, websockets_1.SubscribeMessage)('session:create')];
        _handleJoin_decorators = [(0, websockets_1.SubscribeMessage)('session:join')];
        _handleRequestOtp_decorators = [(0, websockets_1.SubscribeMessage)('auth:request-otp')];
        _handleAuthSubmit_decorators = [(0, websockets_1.SubscribeMessage)('auth:submit')];
        _handleCancel_decorators = [(0, websockets_1.SubscribeMessage)('session:cancel')];
        __esDecorate(_classThis, null, _handleCreate_decorators, { kind: "method", name: "handleCreate", static: false, private: false, access: { has: function (obj) { return "handleCreate" in obj; }, get: function (obj) { return obj.handleCreate; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleJoin_decorators, { kind: "method", name: "handleJoin", static: false, private: false, access: { has: function (obj) { return "handleJoin" in obj; }, get: function (obj) { return obj.handleJoin; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleRequestOtp_decorators, { kind: "method", name: "handleRequestOtp", static: false, private: false, access: { has: function (obj) { return "handleRequestOtp" in obj; }, get: function (obj) { return obj.handleRequestOtp; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleAuthSubmit_decorators, { kind: "method", name: "handleAuthSubmit", static: false, private: false, access: { has: function (obj) { return "handleAuthSubmit" in obj; }, get: function (obj) { return obj.handleAuthSubmit; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleCancel_decorators, { kind: "method", name: "handleCancel", static: false, private: false, access: { has: function (obj) { return "handleCancel" in obj; }, get: function (obj) { return obj.handleCancel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _server_decorators, { kind: "field", name: "server", static: false, private: false, access: { has: function (obj) { return "server" in obj; }, get: function (obj) { return obj.server; }, set: function (obj, value) { obj.server = value; } }, metadata: _metadata }, _server_initializers, _server_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TunnelGateway = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TunnelGateway = _classThis;
}();
exports.TunnelGateway = TunnelGateway;
