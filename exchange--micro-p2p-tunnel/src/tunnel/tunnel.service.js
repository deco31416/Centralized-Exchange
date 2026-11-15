"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.TunnelService = void 0;
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
/* ─── Servicio ────────────────────────────────── */
var TunnelService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var TunnelService = _classThis = /** @class */ (function () {
        function TunnelService_1(model, sigKeysClient, walletLedgerClient, configService) {
            this.model = model;
            this.sigKeysClient = sigKeysClient;
            this.walletLedgerClient = walletLedgerClient;
            this.configService = configService;
            this.logger = new common_1.Logger(TunnelService.name);
            /**
             * In-memory map: sessionId → Set<userId> de usuarios con OTP ya solicitado.
             * Evita solicitar OTP duplicado dentro de la misma sesión.
             */
            this.otpRequested = new Map();
            /**
             * In-memory map: sessionId → Map<userId, otpCode>.
             * Almacena el OTP confirmado para usarlo al ejecutar la transferencia.
             */
            this.otpStore = new Map();
            this.sessionTtlMinutes = Number(configService.get('SESSION_TTL_MINUTES') || '15');
        }
        /* ─── Helpers ──────────────────────────────── */
        TunnelService_1.prototype.generateInviteCode = function () {
            // 6 dígitos aleatorios
            return Math.floor(100000 + Math.random() * 900000).toString();
        };
        TunnelService_1.prototype.isParticipantFullyAuthorized = function (auth, requiredMethods) {
            for (var _i = 0, requiredMethods_1 = requiredMethods; _i < requiredMethods_1.length; _i++) {
                var m = requiredMethods_1[_i];
                var key = m;
                if (auth[key] !== 'verified')
                    return false;
            }
            return true;
        };
        TunnelService_1.prototype.areBothAuthorized = function (session) {
            if (!session.joinerUserId)
                return false;
            return (this.isParticipantFullyAuthorized(session.creatorAuth, session.requiredMethods) &&
                this.isParticipantFullyAuthorized(session.joinerAuth, session.requiredMethods));
        };
        TunnelService_1.prototype.toSessionView = function (doc) {
            return {
                sessionId: doc.sessionId,
                inviteCode: doc.inviteCode,
                status: doc.status,
                currency: doc.currency,
                amountMinorUnits: doc.amountMinorUnits,
                concept: doc.concept,
                requiredMethods: doc.requiredMethods,
                expiresAt: doc.expiresAt.toISOString(),
                creator: {
                    userId: doc.creatorUserId,
                    role: 'creator',
                    auth: {
                        pin: doc.creatorAuth.pin,
                        dynamicKey: doc.creatorAuth.dynamicKey,
                        emailOtp: doc.creatorAuth.emailOtp,
                    },
                },
                joiner: doc.joinerUserId
                    ? {
                        userId: doc.joinerUserId,
                        role: 'joiner',
                        auth: {
                            pin: doc.joinerAuth.pin,
                            dynamicKey: doc.joinerAuth.dynamicKey,
                            emailOtp: doc.joinerAuth.emailOtp,
                        },
                    }
                    : null,
                transferTxId: doc.transferTxId,
            };
        };
        /* ─── Crear sesión ─────────────────────────── */
        TunnelService_1.prototype.createSession = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var sessionId, inviteCode, expiresAt, session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            sessionId = (0, crypto_1.randomUUID)();
                            inviteCode = this.generateInviteCode();
                            expiresAt = new Date(Date.now() + this.sessionTtlMinutes * 60 * 1000);
                            return [4 /*yield*/, this.model.create({
                                    sessionId: sessionId,
                                    inviteCode: inviteCode,
                                    status: 'WAITING',
                                    currency: input.currency,
                                    amountMinorUnits: input.amountMinorUnits,
                                    concept: input.concept,
                                    creatorUserId: input.userId,
                                    creatorEmail: input.email,
                                    creatorAuth: { pin: 'pending', dynamicKey: 'pending', emailOtp: 'pending' },
                                    joinerAuth: { pin: 'pending', dynamicKey: 'pending', emailOtp: 'pending' },
                                    requiredMethods: input.requiredMethods || ['pin', 'dynamicKey', 'emailOtp'],
                                    expiresAt: expiresAt,
                                })];
                        case 1:
                            session = _a.sent();
                            this.logger.log("Session created: ".concat(sessionId, " by ").concat(input.userId));
                            return [2 /*return*/, this.toSessionView(session)];
                    }
                });
            });
        };
        /* ─── Unirse a sesión ──────────────────────── */
        TunnelService_1.prototype.joinSession = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.model.findOne({
                                inviteCode: input.inviteCode,
                                status: 'WAITING',
                            })];
                        case 1:
                            session = _a.sent();
                            if (!session) {
                                return [2 /*return*/, { error: 'SESSION_NOT_FOUND' }];
                            }
                            if (!(new Date() > session.expiresAt)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.model.updateOne({ sessionId: session.sessionId }, { status: 'EXPIRED' })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { error: 'SESSION_EXPIRED' }];
                        case 3:
                            if (session.creatorUserId === input.userId) {
                                return [2 /*return*/, { error: 'CANNOT_JOIN_OWN_SESSION' }];
                            }
                            session.joinerUserId = input.userId;
                            session.joinerEmail = input.email;
                            session.status = 'ACTIVE';
                            return [4 /*yield*/, session.save()];
                        case 4:
                            _a.sent();
                            this.logger.log("Session ".concat(session.sessionId, ": ").concat(input.userId, " joined"));
                            return [2 /*return*/, this.toSessionView(session)];
                    }
                });
            });
        };
        /* ─── Obtener sesión ───────────────────────── */
        TunnelService_1.prototype.getSession = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var session;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.model.findOne({ sessionId: sessionId })];
                        case 1:
                            session = _a.sent();
                            return [2 /*return*/, session ? this.toSessionView(session) : null];
                    }
                });
            });
        };
        /* ─── Solicitar OTP email ──────────────────── */
        TunnelService_1.prototype.requestEmailOtp = function (sessionId, userId, email) {
            return __awaiter(this, void 0, void 0, function () {
                var requested, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Evitar doble solicitud
                            if (!this.otpRequested.has(sessionId)) {
                                this.otpRequested.set(sessionId, new Set());
                            }
                            requested = this.otpRequested.get(sessionId);
                            if (requested.has(userId)) {
                                return [2 /*return*/, { success: true, expiresInSeconds: 0 }];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.walletLedgerClient.requestOtp({
                                    userId: userId,
                                    email: email,
                                })];
                        case 2:
                            result = _a.sent();
                            requested.add(userId);
                            this.logger.log("OTP requested for ".concat(userId, " in session ").concat(sessionId));
                            return [2 /*return*/, {
                                    success: true,
                                    expiresInSeconds: result.expiresInSeconds,
                                    otp: result.otp, // solo en dev mode
                                }];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.error("OTP request failed: ".concat(error_1 === null || error_1 === void 0 ? void 0 : error_1.message));
                            return [2 /*return*/, { success: false }];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /* ─── Verificar método de auth ─────────────── */
        TunnelService_1.prototype.verifyAuthMethod = function (input) {
            return __awaiter(this, void 0, void 0, function () {
                var session, isCreator, isJoiner, verified, _a, authField, newState, updated, participantAuth, participantFullyAuthorized, bothAuthorized;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.model.findOne({
                                sessionId: input.sessionId,
                                status: { $in: ['ACTIVE', 'WAITING'] },
                            })];
                        case 1:
                            session = _c.sent();
                            if (!session) {
                                return [2 /*return*/, { error: 'SESSION_NOT_FOUND' }];
                            }
                            if (!(new Date() > session.expiresAt)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.model.updateOne({ sessionId: session.sessionId }, { status: 'EXPIRED' })];
                        case 2:
                            _c.sent();
                            return [2 /*return*/, { error: 'SESSION_EXPIRED' }];
                        case 3:
                            isCreator = session.creatorUserId === input.userId;
                            isJoiner = session.joinerUserId === input.userId;
                            if (!isCreator && !isJoiner) {
                                return [2 /*return*/, { error: 'NOT_PARTICIPANT' }];
                            }
                            verified = false;
                            _a = input.method;
                            switch (_a) {
                                case 'pin': return [3 /*break*/, 4];
                                case 'dynamicKey': return [3 /*break*/, 6];
                                case 'emailOtp': return [3 /*break*/, 8];
                            }
                            return [3 /*break*/, 9];
                        case 4: return [4 /*yield*/, this.sigKeysClient.verifyPin(input.userId, input.value)];
                        case 5:
                            verified = _c.sent();
                            return [3 /*break*/, 9];
                        case 6: return [4 /*yield*/, this.sigKeysClient.verifyDynamicKey(input.userId, input.value)];
                        case 7:
                            verified = _c.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            // El OTP de email se verifica al momento de ejecutar la transferencia
                            // en wallet-ledger. Aquí lo almacenamos para usarlo después.
                            // Por ahora, marcamos como verified (se validará al final).
                            // Almacenar el código OTP para la ejecución
                            if (!this.otpStore.has(input.sessionId)) {
                                this.otpStore.set(input.sessionId, new Map());
                            }
                            this.otpStore.get(input.sessionId).set(input.userId, input.value);
                            verified = true;
                            return [3 /*break*/, 9];
                        case 9:
                            authField = isCreator ? 'creatorAuth' : 'joinerAuth';
                            newState = verified ? 'verified' : 'failed';
                            return [4 /*yield*/, this.model.updateOne({ sessionId: input.sessionId }, (_b = {}, _b["".concat(authField, ".").concat(input.method)] = newState, _b))];
                        case 10:
                            _c.sent();
                            return [4 /*yield*/, this.model.findOne({
                                    sessionId: input.sessionId,
                                })];
                        case 11:
                            updated = _c.sent();
                            participantAuth = isCreator
                                ? updated.creatorAuth
                                : updated.joinerAuth;
                            // Aplicar el cambio local (puede no haberse reflejado en el reload)
                            participantAuth[input.method] = newState;
                            participantFullyAuthorized = this.isParticipantFullyAuthorized(participantAuth, updated.requiredMethods);
                            bothAuthorized = this.areBothAuthorized(updated);
                            return [2 /*return*/, {
                                    verified: verified,
                                    method: input.method,
                                    participantFullyAuthorized: participantFullyAuthorized,
                                    bothAuthorized: bothAuthorized,
                                }];
                    }
                });
            });
        };
        /* ─── Ejecutar transferencia ───────────────── */
        TunnelService_1.prototype.executeTransfer = function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var session, otpMap, payerOtp, result, error_2;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.model.findOne({ sessionId: sessionId, status: 'ACTIVE' })];
                        case 1:
                            session = _c.sent();
                            if (!session) {
                                return [2 /*return*/, { success: false, reason: 'SESSION_NOT_FOUND' }];
                            }
                            if (!this.areBothAuthorized(session)) {
                                return [2 /*return*/, { success: false, reason: 'NOT_FULLY_AUTHORIZED' }];
                            }
                            // Marcar como ejecutando
                            session.status = 'EXECUTING';
                            return [4 /*yield*/, session.save()];
                        case 2:
                            _c.sent();
                            otpMap = this.otpStore.get(sessionId);
                            payerOtp = otpMap === null || otpMap === void 0 ? void 0 : otpMap.get(session.joinerUserId);
                            _c.label = 3;
                        case 3:
                            _c.trys.push([3, 8, , 10]);
                            return [4 /*yield*/, this.walletLedgerClient.executeP2PTransfer({
                                    fromUserId: session.joinerUserId,
                                    toUserId: session.creatorUserId,
                                    currency: session.currency,
                                    amountMinorUnits: session.amountMinorUnits,
                                    otp: payerOtp,
                                    concept: session.concept,
                                })];
                        case 4:
                            result = _c.sent();
                            if (!(result.status === 'applied')) return [3 /*break*/, 6];
                            session.status = 'COMPLETED';
                            session.transferTxId = result.txId;
                            session.transferCorrelationId = result.correlationId;
                            return [4 /*yield*/, session.save()];
                        case 5:
                            _c.sent();
                            this.cleanupSession(sessionId);
                            this.logger.log("Transfer completed: ".concat(sessionId, " txId=").concat(result.txId));
                            return [2 /*return*/, {
                                    success: true,
                                    txId: result.txId,
                                    correlationId: result.correlationId,
                                }];
                        case 6:
                            // Rejected
                            session.status = 'ACTIVE'; // Revert to allow retry
                            return [4 /*yield*/, session.save()];
                        case 7:
                            _c.sent();
                            this.logger.warn("Transfer rejected: ".concat(sessionId, " reason=").concat(result.reason));
                            return [2 /*return*/, { success: false, reason: result.reason }];
                        case 8:
                            error_2 = _c.sent();
                            session.status = 'ACTIVE';
                            return [4 /*yield*/, session.save()];
                        case 9:
                            _c.sent();
                            this.logger.error("Transfer error: ".concat(sessionId, " ").concat(error_2 === null || error_2 === void 0 ? void 0 : error_2.message));
                            return [2 /*return*/, {
                                    success: false,
                                    reason: ((_b = (_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'TRANSFER_FAILED',
                                }];
                        case 10: return [2 /*return*/];
                    }
                });
            });
        };
        /* ─── Cancelar sesión ──────────────────────── */
        TunnelService_1.prototype.cancelSession = function (sessionId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.model.updateOne({
                                sessionId: sessionId,
                                status: { $in: ['WAITING', 'ACTIVE'] },
                                $or: [{ creatorUserId: userId }, { joinerUserId: userId }],
                            }, { status: 'CANCELLED' })];
                        case 1:
                            result = _a.sent();
                            if (result.modifiedCount > 0) {
                                this.cleanupSession(sessionId);
                                this.logger.log("Session cancelled: ".concat(sessionId, " by ").concat(userId));
                                return [2 /*return*/, { success: true }];
                            }
                            return [2 /*return*/, { success: false }];
                    }
                });
            });
        };
        /* ─── Cleanup in-memory ────────────────────── */
        TunnelService_1.prototype.cleanupSession = function (sessionId) {
            this.otpRequested.delete(sessionId);
            this.otpStore.delete(sessionId);
        };
        return TunnelService_1;
    }());
    __setFunctionName(_classThis, "TunnelService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TunnelService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TunnelService = _classThis;
}();
exports.TunnelService = TunnelService;
