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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TunnelSessionSchema = exports.TunnelSession = exports.ParticipantAuthSchema = exports.ParticipantAuth = void 0;
var mongoose_1 = require("@nestjs/mongoose");
var ParticipantAuth = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({ _id: false })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _pin_decorators;
    var _pin_initializers = [];
    var _pin_extraInitializers = [];
    var _dynamicKey_decorators;
    var _dynamicKey_initializers = [];
    var _dynamicKey_extraInitializers = [];
    var _emailOtp_decorators;
    var _emailOtp_initializers = [];
    var _emailOtp_extraInitializers = [];
    var ParticipantAuth = _classThis = /** @class */ (function () {
        function ParticipantAuth_1() {
            this.pin = __runInitializers(this, _pin_initializers, void 0);
            this.dynamicKey = (__runInitializers(this, _pin_extraInitializers), __runInitializers(this, _dynamicKey_initializers, void 0));
            this.emailOtp = (__runInitializers(this, _dynamicKey_extraInitializers), __runInitializers(this, _emailOtp_initializers, void 0));
            __runInitializers(this, _emailOtp_extraInitializers);
        }
        return ParticipantAuth_1;
    }());
    __setFunctionName(_classThis, "ParticipantAuth");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _pin_decorators = [(0, mongoose_1.Prop)({ default: 'pending' })];
        _dynamicKey_decorators = [(0, mongoose_1.Prop)({ default: 'pending' })];
        _emailOtp_decorators = [(0, mongoose_1.Prop)({ default: 'pending' })];
        __esDecorate(null, null, _pin_decorators, { kind: "field", name: "pin", static: false, private: false, access: { has: function (obj) { return "pin" in obj; }, get: function (obj) { return obj.pin; }, set: function (obj, value) { obj.pin = value; } }, metadata: _metadata }, _pin_initializers, _pin_extraInitializers);
        __esDecorate(null, null, _dynamicKey_decorators, { kind: "field", name: "dynamicKey", static: false, private: false, access: { has: function (obj) { return "dynamicKey" in obj; }, get: function (obj) { return obj.dynamicKey; }, set: function (obj, value) { obj.dynamicKey = value; } }, metadata: _metadata }, _dynamicKey_initializers, _dynamicKey_extraInitializers);
        __esDecorate(null, null, _emailOtp_decorators, { kind: "field", name: "emailOtp", static: false, private: false, access: { has: function (obj) { return "emailOtp" in obj; }, get: function (obj) { return obj.emailOtp; }, set: function (obj, value) { obj.emailOtp = value; } }, metadata: _metadata }, _emailOtp_initializers, _emailOtp_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ParticipantAuth = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ParticipantAuth = _classThis;
}();
exports.ParticipantAuth = ParticipantAuth;
exports.ParticipantAuthSchema = mongoose_1.SchemaFactory.createForClass(ParticipantAuth);
/* ─── Session schema ──────────────────────────── */
var TunnelSession = function () {
    var _classDecorators = [(0, mongoose_1.Schema)({
            collection: 'tunnel_sessions',
            timestamps: true,
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _sessionId_decorators;
    var _sessionId_initializers = [];
    var _sessionId_extraInitializers = [];
    var _inviteCode_decorators;
    var _inviteCode_initializers = [];
    var _inviteCode_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    var _amountMinorUnits_decorators;
    var _amountMinorUnits_initializers = [];
    var _amountMinorUnits_extraInitializers = [];
    var _concept_decorators;
    var _concept_initializers = [];
    var _concept_extraInitializers = [];
    var _creatorUserId_decorators;
    var _creatorUserId_initializers = [];
    var _creatorUserId_extraInitializers = [];
    var _creatorEmail_decorators;
    var _creatorEmail_initializers = [];
    var _creatorEmail_extraInitializers = [];
    var _joinerUserId_decorators;
    var _joinerUserId_initializers = [];
    var _joinerUserId_extraInitializers = [];
    var _joinerEmail_decorators;
    var _joinerEmail_initializers = [];
    var _joinerEmail_extraInitializers = [];
    var _creatorAuth_decorators;
    var _creatorAuth_initializers = [];
    var _creatorAuth_extraInitializers = [];
    var _joinerAuth_decorators;
    var _joinerAuth_initializers = [];
    var _joinerAuth_extraInitializers = [];
    var _requiredMethods_decorators;
    var _requiredMethods_initializers = [];
    var _requiredMethods_extraInitializers = [];
    var _transferTxId_decorators;
    var _transferTxId_initializers = [];
    var _transferTxId_extraInitializers = [];
    var _transferCorrelationId_decorators;
    var _transferCorrelationId_initializers = [];
    var _transferCorrelationId_extraInitializers = [];
    var _expiresAt_decorators;
    var _expiresAt_initializers = [];
    var _expiresAt_extraInitializers = [];
    var TunnelSession = _classThis = /** @class */ (function () {
        function TunnelSession_1() {
            this.sessionId = __runInitializers(this, _sessionId_initializers, void 0);
            this.inviteCode = (__runInitializers(this, _sessionId_extraInitializers), __runInitializers(this, _inviteCode_initializers, void 0));
            this.status = (__runInitializers(this, _inviteCode_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            /* ── Payment details ── */
            this.currency = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
            this.amountMinorUnits = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _amountMinorUnits_initializers, void 0));
            this.concept = (__runInitializers(this, _amountMinorUnits_extraInitializers), __runInitializers(this, _concept_initializers, void 0));
            /* ── Participants ── */
            this.creatorUserId = (__runInitializers(this, _concept_extraInitializers), __runInitializers(this, _creatorUserId_initializers, void 0));
            this.creatorEmail = (__runInitializers(this, _creatorUserId_extraInitializers), __runInitializers(this, _creatorEmail_initializers, void 0));
            this.joinerUserId = (__runInitializers(this, _creatorEmail_extraInitializers), __runInitializers(this, _joinerUserId_initializers, void 0));
            this.joinerEmail = (__runInitializers(this, _joinerUserId_extraInitializers), __runInitializers(this, _joinerEmail_initializers, void 0));
            /* ── Auth state (embedded sub-documents) ── */
            this.creatorAuth = (__runInitializers(this, _joinerEmail_extraInitializers), __runInitializers(this, _creatorAuth_initializers, void 0));
            this.joinerAuth = (__runInitializers(this, _creatorAuth_extraInitializers), __runInitializers(this, _joinerAuth_initializers, void 0));
            /* ── Required methods (from security policy) ── */
            this.requiredMethods = (__runInitializers(this, _joinerAuth_extraInitializers), __runInitializers(this, _requiredMethods_initializers, void 0));
            /* ── Transfer result ── */
            this.transferTxId = (__runInitializers(this, _requiredMethods_extraInitializers), __runInitializers(this, _transferTxId_initializers, void 0));
            this.transferCorrelationId = (__runInitializers(this, _transferTxId_extraInitializers), __runInitializers(this, _transferCorrelationId_initializers, void 0));
            /* ── Timing ── */
            this.expiresAt = (__runInitializers(this, _transferCorrelationId_extraInitializers), __runInitializers(this, _expiresAt_initializers, void 0));
            __runInitializers(this, _expiresAt_extraInitializers);
        }
        return TunnelSession_1;
    }());
    __setFunctionName(_classThis, "TunnelSession");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _sessionId_decorators = [(0, mongoose_1.Prop)({ required: true, unique: true, index: true })];
        _inviteCode_decorators = [(0, mongoose_1.Prop)({ required: true, unique: true, index: true })];
        _status_decorators = [(0, mongoose_1.Prop)({ required: true, default: 'WAITING', index: true })];
        _currency_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _amountMinorUnits_decorators = [(0, mongoose_1.Prop)({ required: true })];
        _concept_decorators = [(0, mongoose_1.Prop)()];
        _creatorUserId_decorators = [(0, mongoose_1.Prop)({ required: true, index: true })];
        _creatorEmail_decorators = [(0, mongoose_1.Prop)()];
        _joinerUserId_decorators = [(0, mongoose_1.Prop)()];
        _joinerEmail_decorators = [(0, mongoose_1.Prop)()];
        _creatorAuth_decorators = [(0, mongoose_1.Prop)({ type: exports.ParticipantAuthSchema, default: function () { return ({}); } })];
        _joinerAuth_decorators = [(0, mongoose_1.Prop)({ type: exports.ParticipantAuthSchema, default: function () { return ({}); } })];
        _requiredMethods_decorators = [(0, mongoose_1.Prop)({ type: [String], default: ['pin', 'dynamicKey', 'emailOtp'] })];
        _transferTxId_decorators = [(0, mongoose_1.Prop)()];
        _transferCorrelationId_decorators = [(0, mongoose_1.Prop)()];
        _expiresAt_decorators = [(0, mongoose_1.Prop)({ required: true, index: true })];
        __esDecorate(null, null, _sessionId_decorators, { kind: "field", name: "sessionId", static: false, private: false, access: { has: function (obj) { return "sessionId" in obj; }, get: function (obj) { return obj.sessionId; }, set: function (obj, value) { obj.sessionId = value; } }, metadata: _metadata }, _sessionId_initializers, _sessionId_extraInitializers);
        __esDecorate(null, null, _inviteCode_decorators, { kind: "field", name: "inviteCode", static: false, private: false, access: { has: function (obj) { return "inviteCode" in obj; }, get: function (obj) { return obj.inviteCode; }, set: function (obj, value) { obj.inviteCode = value; } }, metadata: _metadata }, _inviteCode_initializers, _inviteCode_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
        __esDecorate(null, null, _amountMinorUnits_decorators, { kind: "field", name: "amountMinorUnits", static: false, private: false, access: { has: function (obj) { return "amountMinorUnits" in obj; }, get: function (obj) { return obj.amountMinorUnits; }, set: function (obj, value) { obj.amountMinorUnits = value; } }, metadata: _metadata }, _amountMinorUnits_initializers, _amountMinorUnits_extraInitializers);
        __esDecorate(null, null, _concept_decorators, { kind: "field", name: "concept", static: false, private: false, access: { has: function (obj) { return "concept" in obj; }, get: function (obj) { return obj.concept; }, set: function (obj, value) { obj.concept = value; } }, metadata: _metadata }, _concept_initializers, _concept_extraInitializers);
        __esDecorate(null, null, _creatorUserId_decorators, { kind: "field", name: "creatorUserId", static: false, private: false, access: { has: function (obj) { return "creatorUserId" in obj; }, get: function (obj) { return obj.creatorUserId; }, set: function (obj, value) { obj.creatorUserId = value; } }, metadata: _metadata }, _creatorUserId_initializers, _creatorUserId_extraInitializers);
        __esDecorate(null, null, _creatorEmail_decorators, { kind: "field", name: "creatorEmail", static: false, private: false, access: { has: function (obj) { return "creatorEmail" in obj; }, get: function (obj) { return obj.creatorEmail; }, set: function (obj, value) { obj.creatorEmail = value; } }, metadata: _metadata }, _creatorEmail_initializers, _creatorEmail_extraInitializers);
        __esDecorate(null, null, _joinerUserId_decorators, { kind: "field", name: "joinerUserId", static: false, private: false, access: { has: function (obj) { return "joinerUserId" in obj; }, get: function (obj) { return obj.joinerUserId; }, set: function (obj, value) { obj.joinerUserId = value; } }, metadata: _metadata }, _joinerUserId_initializers, _joinerUserId_extraInitializers);
        __esDecorate(null, null, _joinerEmail_decorators, { kind: "field", name: "joinerEmail", static: false, private: false, access: { has: function (obj) { return "joinerEmail" in obj; }, get: function (obj) { return obj.joinerEmail; }, set: function (obj, value) { obj.joinerEmail = value; } }, metadata: _metadata }, _joinerEmail_initializers, _joinerEmail_extraInitializers);
        __esDecorate(null, null, _creatorAuth_decorators, { kind: "field", name: "creatorAuth", static: false, private: false, access: { has: function (obj) { return "creatorAuth" in obj; }, get: function (obj) { return obj.creatorAuth; }, set: function (obj, value) { obj.creatorAuth = value; } }, metadata: _metadata }, _creatorAuth_initializers, _creatorAuth_extraInitializers);
        __esDecorate(null, null, _joinerAuth_decorators, { kind: "field", name: "joinerAuth", static: false, private: false, access: { has: function (obj) { return "joinerAuth" in obj; }, get: function (obj) { return obj.joinerAuth; }, set: function (obj, value) { obj.joinerAuth = value; } }, metadata: _metadata }, _joinerAuth_initializers, _joinerAuth_extraInitializers);
        __esDecorate(null, null, _requiredMethods_decorators, { kind: "field", name: "requiredMethods", static: false, private: false, access: { has: function (obj) { return "requiredMethods" in obj; }, get: function (obj) { return obj.requiredMethods; }, set: function (obj, value) { obj.requiredMethods = value; } }, metadata: _metadata }, _requiredMethods_initializers, _requiredMethods_extraInitializers);
        __esDecorate(null, null, _transferTxId_decorators, { kind: "field", name: "transferTxId", static: false, private: false, access: { has: function (obj) { return "transferTxId" in obj; }, get: function (obj) { return obj.transferTxId; }, set: function (obj, value) { obj.transferTxId = value; } }, metadata: _metadata }, _transferTxId_initializers, _transferTxId_extraInitializers);
        __esDecorate(null, null, _transferCorrelationId_decorators, { kind: "field", name: "transferCorrelationId", static: false, private: false, access: { has: function (obj) { return "transferCorrelationId" in obj; }, get: function (obj) { return obj.transferCorrelationId; }, set: function (obj, value) { obj.transferCorrelationId = value; } }, metadata: _metadata }, _transferCorrelationId_initializers, _transferCorrelationId_extraInitializers);
        __esDecorate(null, null, _expiresAt_decorators, { kind: "field", name: "expiresAt", static: false, private: false, access: { has: function (obj) { return "expiresAt" in obj; }, get: function (obj) { return obj.expiresAt; }, set: function (obj, value) { obj.expiresAt = value; } }, metadata: _metadata }, _expiresAt_initializers, _expiresAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TunnelSession = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TunnelSession = _classThis;
}();
exports.TunnelSession = TunnelSession;
exports.TunnelSessionSchema = mongoose_1.SchemaFactory.createForClass(TunnelSession);
// TTL index: MongoDB auto-deletes expired sessions after 1 hour of grace
exports.TunnelSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
