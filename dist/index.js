"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moon_1 = require("@moonjot/moon");
const moon_utils_1 = require("@moonjot/moon-utils");
const template_1 = require("./template");
class default_1 extends moon_1.MoonPlugin {
    constructor(props) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(props);
        this.name = 'Supernotes';
        this.logo = 'https://www.markdownguide.org/assets/images/tool-icons/supernotes.png';
        this.settingsDescription = {
            token: {
                type: 'string',
                required: true,
                label: 'Token',
                description: 'Supernotes API token.'
            },
            template: {
                type: 'text',
                required: true,
                label: 'Template of capture',
                description: 'Format your note result inside Supernotes. [Documentation](https://github.com/castroCrea/moon-supernotes-plugin/blob/main/README.md)',
                default: template_1.DEFAULT_TEMPLATE
            },
            tags: {
                type: 'string',
                required: true,
                label: 'Auto tagging',
                description: 'You can auto-generate tags by adding the path to the context object property separated by \',\'. Refer to the provided documentation that explains \'context object\' such as \'source.type, source.location\'. [Documentation](https://github.com/castroCrea/moon/blob/b35e939b7b137871896f2c61413045153d3c4310/src/FetchContext.type.ts#L52-L53).',
                default: 'context.source.type'
            }
        };
        this.settings = {
            token: '',
            template: template_1.DEFAULT_TEMPLATE,
            tags: 'context.source.type'
        };
        this.integration = {
            callback: ({ context, markdown }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                const handleDateContent = (0, moon_utils_1.turnDate)({ content: this.settings.template });
                const searchObj = Object.assign({ content: markdown }, context);
                const handlePropertiesContent = (_a = (0, moon_utils_1.handleReplacingProperties)({ content: handleDateContent, searchObj })) !== null && _a !== void 0 ? _a : '';
                let handleConditionContent = (_c = (_b = (0, moon_utils_1.handleConditions)({ content: handlePropertiesContent, searchObj })) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                const title = (0, moon_utils_1.extractTitleFromMarkdown)(handleConditionContent);
                if (handleConditionContent.startsWith('# '))
                    handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n');
                const handleTags = ((_d = this.settings.tags) !== null && _d !== void 0 ? _d : '').split(',').map(tag => (0, moon_utils_1.searchObject)({ obj: searchObj, path: tag.trim() })).filter(tag => !!tag);
                const payload = {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    name: title || context.source.title || (0, moon_utils_1.turnDate)({ content: '{{DATE}}YYYY-MM-DD HH:mm{{END_DATE}}' }),
                    markup: handleConditionContent,
                    tags: handleTags
                };
                const response = yield fetch('https://api.supernotes.app/v1/cards/simple', {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'api-key': this.settings.token,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const jsonResponse = yield response.json();
                return jsonResponse[0].success === true;
            }),
            buttonIconUrl: 'https://www.markdownguide.org/assets/images/tool-icons/supernotes.png'
        };
        if (!props)
            return;
        if (props.settings)
            this.settings = Object.assign(Object.assign({}, this.settings), props.settings);
        this.log = props.helpers.moonLog;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map