'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const environmentController_1 = require('./controllers/environmentController');
const Constants = require('./constants');
var uuid = require('node-uuid');
var moment = require('moment');
class VariableProcessor {
    static processRawRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let globalVariables = VariableProcessor.getGlobalVariables();
            for (var variablePattern in globalVariables) {
                let regex = new RegExp(`\\{\\{${variablePattern}\\}\\}`, 'g');
                if (regex.test(request)) {
                    request = request.replace(regex, globalVariables[variablePattern]);
                }
            }
            let customVariables = yield environmentController_1.EnvironmentController.getCustomVariables();
            for (var variableName in customVariables) {
                let regex = new RegExp(`\\{\\{${variableName}\\}\\}`, 'g');
                if (regex.test(request)) {
                    request = request.replace(regex, customVariables[variableName]);
                }
            }
            return request;
        });
    }
    static getGlobalVariables() {
        return {
            [`\\${Constants.TimeStampVariableName}(?:\\s(\\-?\\d+)\\s(y|Q|M|w|d|h|m|s|ms))?`]: match => {
                let regex = new RegExp(`\\${Constants.TimeStampVariableName}(?:\\s(\\-?\\d+)\\s(y|Q|M|w|d|h|m|s|ms))?`);
                let groups = regex.exec(match);
                if (groups !== null && groups.length === 3) {
                    return groups[1] && groups[2]
                        ? moment.utc().add(groups[1], groups[2]).unix()
                        : moment.utc().unix();
                }
                return match;
            },
            [`\\${Constants.GuidVariableName}`]: match => uuid.v4(),
            [`\\${Constants.RandomInt}\\s(\\-?\\d+)\\s(\\-?\\d+)`]: match => {
                let regex = new RegExp(`\\${Constants.RandomInt}\\s(\\-?\\d+)\\s(\\-?\\d+)`);
                let groups = regex.exec(match);
                if (groups !== null) {
                    let min = Number(groups[1]);
                    let max = Number(groups[2]);
                    if (min < max) {
                        min = Math.ceil(min);
                        max = Math.floor(max);
                        return Math.floor(Math.random() * (max - min)) + min;
                    }
                }
                return match;
            }
        };
    }
}
exports.VariableProcessor = VariableProcessor;
//# sourceMappingURL=variableProcessor.js.map