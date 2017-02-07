"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const vscode_1 = require('vscode');
const configurationSettings_1 = require('../models/configurationSettings');
const environmentPickItem_1 = require('../models/environmentPickItem');
const persistUtility_1 = require('../persistUtility');
const Constants = require('../constants');
const telemetry_1 = require('../telemetry');
class EnvironmentController {
    constructor(initEnvironment) {
        this._environmentStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 100);
        this._environmentStatusBarItem.command = 'rest-client.switch-environment';
        this._environmentStatusBarItem.text = initEnvironment.label;
        this._environmentStatusBarItem.tooltip = 'Switch REST Client Environment';
        this._environmentStatusBarItem.show();
        this._restClientSettings = new configurationSettings_1.RestClientSettings();
    }
    switchEnvironment() {
        return __awaiter(this, void 0, void 0, function* () {
            telemetry_1.Telemetry.sendEvent('Switch Environment');
            let currentEnvironment = yield EnvironmentController.getCurrentEnvironment();
            let itemPickList = [];
            itemPickList.push(EnvironmentController.noEnvironmentPickItem);
            for (var name in this._restClientSettings.environmentVariables) {
                let item = new environmentPickItem_1.EnvironmentPickItem(name, name);
                if (item.name === currentEnvironment.name) {
                    item.description = '$(check)';
                }
                itemPickList.push(item);
            }
            let item = yield vscode_1.window.showQuickPick(itemPickList, { placeHolder: "Select REST Client Environment" });
            if (!item) {
                return;
            }
            this._environmentStatusBarItem.text = item.label;
            yield persistUtility_1.PersistUtility.saveEnvironment(item);
        });
    }
    static getCurrentEnvironment() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentEnvironment = yield persistUtility_1.PersistUtility.loadEnvironment();
            if (!currentEnvironment) {
                currentEnvironment = EnvironmentController.noEnvironmentPickItem;
                yield persistUtility_1.PersistUtility.saveEnvironment(currentEnvironment);
            }
            return currentEnvironment;
        });
    }
    static getCustomVariables(environment = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!environment) {
                environment = yield EnvironmentController.getCurrentEnvironment();
            }
            let settings = new configurationSettings_1.RestClientSettings();
            for (var environmentName in settings.environmentVariables) {
                if (environmentName === environment.name) {
                    return settings.environmentVariables[environmentName];
                }
            }
            return new Map();
        });
    }
    dispose() {
    }
}
EnvironmentController.noEnvironmentPickItem = new environmentPickItem_1.EnvironmentPickItem('No Environment', Constants.NoEnvironmentSelectedName, 'DO NOT Use Any Environment');
exports.EnvironmentController = EnvironmentController;
//# sourceMappingURL=environmentController.js.map