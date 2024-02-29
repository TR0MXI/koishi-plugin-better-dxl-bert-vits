import { Context, Schema, h } from 'koishi'
import Vits from '@initencounter/vits'
import { SpeakerIdMap, nameMap, Language, SpeakerKeyIdMap } from './list'

class BertVits extends Vits {
    declare logger: any

    constructor(ctx: Context, config: BertVits.Config) {
        super(ctx)
        this.config = config
        this.logger = ctx.logger('BertVits')

        ctx.command('bertVit <text:string>', 'AIBertVit语音合成帮助')
            .option('speaker', '-s [speaker:string] 语音合成的讲者', {
                fallback: config.speaker
            })
            .option(
                'sdp_ratio',
                '-sr [sdp_ratio:nubmer] 语音合成的SDP/DP混合比',
                { fallback: config.sdp_ratio }
            )
            .option('noise', '-n [noise:number] 语音合成的感情强度', {
                fallback: config.noise
            })
            .option('noisew', '-nw [noisew:number] 语音合成的音素长度', {
                fallback: config.noisew
            })
            .option('length', '-l [length:number] 语音合成语速', {
                fallback: config.length
            })
            .option('prompt', '-p [prompt:string] 辅助语音合成的情感文本', {
                fallback: config.prompt
            })
            .option('weight', '-w [weight:number] 主文本和辅助文本的混合比率', {
                fallback: config.weight
            })
            .option('language', '-la [language:string] 语音合成的语言', {
                fallback: config.language
            })
            .action(async (s, text) => {
                if (!text) {
                    s.session.execute('bertVit -h')
                    return null
                }
                this.config = s.options
                return await this.say({ input: text })
            })
    }

    async say(options: Vits.Result): Promise<h> {
        const {
            speaker,
            sdp_ratio,
            noise,
            noisew,
            length,
            language,
            prompt,
            weight
        } = this.config

        const version = SpeakerIdMap[speaker]
        const speakerName = nameMap[version]

        const payload = {
            data: [
                options.input,
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

        try {
            const res = await this.ctx.http.post(
                `https://www.modelscope.cn/api/v1/studio/xzjosh/${version}/gradio/run/predict?backend_url=%2Fapi%2Fv1%2Fstudio%2Fxzjosh%2F${version}%2Fgradio%2F&sdk_version=3.47.1&t=${Date.now()}&studio_token=c8fe7633-baa8-4083-a09a-70c45ed8851e`,
                payload
            )
            return h.audio(
                `https://www.modelscope.cn/api/v1/studio/xzjosh/${version}/gradio/file=${res.data[1].name}`
            )
        } catch (error) {
            this.logger.error('ERROR:', error)
            return null
        }
    }
}

namespace BertVits {
    export const usage =
        `## 🌈 使用

    - 建议自行添加别名。

    ## 🌼 指令

    ### bertVit

    - 显示语音合成使用帮助。

    \`\`\`
    bertVit
    \`\`\`

    ### bertVit -s 东雪莲|塔菲|坏女人星瞳...

    - 将输入的文本转换为东雪莲|塔菲|坏女人星瞳...的语音。

    \`\`\`
    bertVit -s 东雪莲|塔菲|坏女人星瞳... 你好
    \`\`\`

    ## 兼容原始 vits 指令

    下表为每个讲者对应的 speaker_id，如果某个使用了 vits 插件的插件需要这个数字的 speaker_id，你可以根据下表来获取实际的 id。

    | 讲者 | speaker_id | 模型 id |
    |-----|-------|-------------
    ` +
        SpeakerKeyIdMap.map(
            (s) => `| ${s[0]} | ${s[1]} | ${SpeakerIdMap[s[0]]} |`
        ).join('\n\n')

    export interface Config {
        speaker: string
        sdp_ratio: number
        noise: number
        noisew: number
        length: number
        language: string
        prompt: string
        weight: number
    }

    export const Config: Schema<Config> = Schema.object({
        speaker: Schema.union(Object.keys(SpeakerIdMap))
            .description('默认讲者')
            .default('向晚'),

        sdp_ratio: Schema.number()
            .min(0)
            .max(1)
            .step(0.1)
            .role('slider')
            .description('SDP/DP混合比')
            .default(0.5),

        noise: Schema.number()
            .min(0.1)
            .max(2)
            .step(0.1)
            .role('slider')
            .description('感情')
            .default(0.6),

        noisew: Schema.number()
            .min(0.1)
            .max(2)
            .step(0.1)
            .role('slider')
            .description('音素长度')
            .default(0.9),

        length: Schema.number()
            .min(0.1)
            .max(2)
            .step(0.1)
            .role('slider')
            .description('语速')
            .default(1),

        language: Schema.union(Language)
            .description('默认语言')
            .default('AUTO'),

        prompt: Schema.string()
            .description('用文字描述生成风格。注意只能使用英文且首字母大写单词')
            .default('Happy'),

        weight: Schema.number()
            .min(0)
            .max(1)
            .step(0)
            .role('slider')
            .description('主文本和辅助文本的混合比率')
            .default(0.7)
    })
}

export default BertVits
