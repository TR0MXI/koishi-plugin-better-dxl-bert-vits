import { Context, h, Logger } from 'koishi'
import Vits from '@initencounter/vits'
import { Config } from './config'
import { APISpeakerList, SpeakerKeyIdMap } from './constants'
import { API, SpeakConfig, Speaker } from './types'

export class BertVits {
    private logger: Logger

    private _cacheSpeakers: Record<string, [API, Speaker, string]> = {}

    constructor(
        private ctx: Context,
        private config: Config
    ) {
        this.logger = ctx.logger('bert-vits')
    }

    async say(input: string, options: Partial<SpeakConfig>): Promise<h> {
        const [api, speaker, lang] = this.findSpeaker(options.speaker)
        options.speaker = speaker.speaker ?? options.speaker
        options.language = lang ?? options.language ?? 'ZH'

        const payload = this._generatePlayLoad(
            input,
            fallback(options, this.config)
        )

        try {
            return await this._request(payload, api, speaker)
        } catch (error) {
            this.logger.error('ERROR:', error)
            throw error
        }
    }

    private findSpeaker(rawSpeaker: string): [API, Speaker, string] {
        if (this._cacheSpeakers[rawSpeaker]) {
            return this._cacheSpeakers[rawSpeaker]
        }

        let [speaker, lang] = rawSpeaker.split('_')

        if (!lang) {
            lang = 'ZH'
        }

        for (const apiSpeakers of APISpeakerList) {
            for (const [currentSpeaker, value] of Object.entries(
                apiSpeakers.speakers
            )) {
                if (speaker === currentSpeaker) {
                    const result: [API, Speaker, string] = [
                        apiSpeakers.api,
                        value,
                        lang
                    ]
                    this._cacheSpeakers[speaker] = result
                    return result
                }
            }
        }
    }

    private _generatePlayLoad(input: string, options: SpeakConfig) {
        const {
            sdp_ratio,
            language,
            speaker,
            noise,
            noisew,
            length,
            prompt,
            weight
        } = options

        return {
            data: [
                input,
                speaker,
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
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async _request(payload: any, api: API, speaker: Speaker) {
        let requestUrl = `${api.base.replace('{version}', speaker.version)}/run/predict`

        const urlParams = new URLSearchParams()

        if (api.params) {
            Object.entries(api.params).forEach(([key, value]) => {
                urlParams.append(
                    key,
                    value
                        .replace('{version}', speaker.version)
                        .replace('{date}', String(Date.now()))
                )
            })

            requestUrl = `${requestUrl}?${urlParams}`
        }

        const res = await this.ctx.http.post(requestUrl, payload)

        return h.audio(
            `${api.base.replace('{version}', speaker.version)}/file=${res.data[1].name}`
        )
    }
}

export class BertVitsService extends Vits {
    constructor(
        ctx: Context,
        public impl: BertVits
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
