import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon'
import { extractTitleFromMarkdown, handleConditions, handleReplacingProperties, turnDate, searchObject } from '@moonjot/moon-utils'
import { DEFAULT_TEMPLATE } from './template'

interface SuperNotesPluginSettingsDescription extends PluginSettingsDescription {
  token: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  template: {
    type: 'text'
    required: boolean
    label: string
    description: string
    default: string
  }
  tags: {
    type: 'string'
    required: boolean
    label: string
    description: string
    default: string
  }
}

interface SuperNotesPluginSettings extends MoonPluginSettings {
  token: string
  template: string
}

export default class extends MoonPlugin {
  name: string = 'Supernotes'
  logo: string = 'https://www.markdownguide.org/assets/images/tool-icons/supernotes.png'

  settingsDescription: SuperNotesPluginSettingsDescription = {
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
      default: DEFAULT_TEMPLATE
    },
    tags: {
      type: 'string',
      required: true,
      label: 'Auto tagging',
      description: 'You can auto-generate tags by adding the path to the context object property separated by \',\'. Refer to the provided documentation that explains \'context object\' such as \'source.type, source.location\'. [Documentation](https://github.com/castroCrea/moon/blob/b35e939b7b137871896f2c61413045153d3c4310/src/FetchContext.type.ts#L52-L53).',
      default: 'context.source.type'
    }
  }

  settings: SuperNotesPluginSettings = {
    token: '',
    template: DEFAULT_TEMPLATE,
    tags: 'context.source.type'
  }

  log: ((log: string) => void) | undefined

  constructor (props?: MoonPluginConstructorProps<SuperNotesPluginSettings>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(props)
    if (!props) return
    if (props.settings) this.settings = { ...this.settings, ...props.settings }
    this.log = props.helpers.moonLog
  }

  integration = {
    callback: async ({ context, markdown }: {
      html: string
      markdown: string
      context: Context
    }
    ) => {
      const handleDateContent = turnDate({ content: this.settings.template })

      const searchObj = {
        content: markdown,
        ...context
      }

      const handlePropertiesContent = handleReplacingProperties({ content: handleDateContent, searchObj }) ?? ''

      let handleConditionContent = handleConditions({ content: handlePropertiesContent, searchObj })?.trim() ?? ''

      const title = extractTitleFromMarkdown(handleConditionContent)

      if (handleConditionContent.startsWith('# ')) handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n')

      const handleTags = (this.settings.tags ?? '').split(',').map(tag => searchObject({ obj: searchObj, path: tag.trim() })).filter(tag => !!tag)

      const payload = {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        name: title || context.source.title || turnDate({ content: '{{DATE}}YYYY-MM-DD HH:mm{{END_DATE}}' }),
        markup: handleConditionContent,
        tags: handleTags
      }

      const response = await fetch('https://api.supernotes.app/v1/cards/simple', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.settings.token,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const jsonResponse = await response.json()
      return jsonResponse[0].success === true
    },
    buttonIconUrl: 'https://www.markdownguide.org/assets/images/tool-icons/supernotes.png'
  }
}
