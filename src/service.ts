import { Context, h, Logger } from 'koishi'
import Vits from '@initencounter/vits'
import { Config } from './config'
import { SpeakerIdMap, nameMap, SpeakerKeyIdMap } from './constants'
import { SpeakConfig } from './types'

export class BertVits {
    private logger: Logger

    constructor(
        private ctx: Context,
        private config: Config
    ) {
        this.logger = ctx.logger('bert-vits')
    }

    async say(input: string, options: Partial<SpeakConfig>): Promise<h> {
        const { version, payload } = this._generatePlayLoad(
            input,
            fallback(options, this.config)
        )

        try {
            return await this._request(payload, version)
        } catch (error) {
            this.logger.error('ERROR:', error)
            throw error
        }
    }

    private _generatePlayLoad(input: string, options: SpeakConfig) {
        const {
            sdp_ratio,
            noise,
            noisew,
            length,
            language,
            prompt,
            weight,
            speaker
        } = options

        const version = SpeakerIdMap[speaker]
        const speakerName = nameMap[version]

        const payload = {
            data: [
                input,
                speakerName,
                sdp_ratio,
                noise,
                noisew,
                length,
                language,
                null,
                prompt,
                'Text prompt',
                '',
                weight
            ],
            event_data: null,
            fn_index: 0,
            dataType: [
                'textbox',
                'dropdown',
                'slider',
                'slider',
                'slider',
                'slider',
                'dropdown',
                'audio',
                'textbox',
                'radio',
                'textbox',
                'slider'
            ],
            session_hash: 'kg71r7fv3e8'
        }

        return {
            version,
            payload
        }
    }

    private async _request(payload: unknown, version: string) {
        const res = await this.ctx.http.post(
            // eslint-disable-next-line max-len
            `https://www.modelscope.cn/api/v1/studio/xzjosh/${version}/gradio/run/predict?backend_url=%2Fapi%2Fv1%2Fstudio%2Fxzjosh%2F${version}%2Fgradio%2F&sdk_version=3.47.1&t=${Date.now()}&studio_token=c8fe7633-baa8-4083-a09a-70c45ed8851e`,
            payload
        )
        return h.audio(
            `https://www.modelscope.cn/api/v1/studio/xzjosh/${version}/gradio/file=${res.data[1].name}`
        )
    }
}

export class BertVitsService extends Vits {
    constructor(
        ctx: Context,
        private impl: BertVits
    ) {
        super(ctx)
    }

    say(options: Vits.Result): Promise<h> {
        if (SpeakerKeyIdMap[options.speaker_id] == null) {
            throw new Error('Invalid speaker_id')
        }

        return this.impl.say(options.input, {
            speaker: SpeakerKeyIdMap[options.speaker_id]
        })
    }
}

// ??
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fallback<T>(options: Partial<T>, defaultValues: any): Required<T> {
    return Object.assign({}, defaultValues, options)
}
