import { Context } from 'koishi'
import { SpeakerIdMap } from './constants'
// eslint-disable-next-line @typescript-eslint/naming-convention
import { BertVits, BertVitsService } from './service'
import { Config } from './config'

export * from './config'

export function apply(ctx: Context, config: Config) {
    const vits = new BertVits(ctx, config)

    // if (config.service) {
    ctx.plugin(BertVitsService, vits)
    // }

    ctx.command('bertVit <text:string>', 'AIBertVit语音合成帮助')
        .option('speaker', '-s [speaker:string] 语音合成的讲者', {
            fallback: config.speaker
        })
        .option('sdp_ratio', '-sr [sdp_ratio:nubmer] 语音合成的SDP/DP混合比', {
            fallback: config.sdp_ratio
        })
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
        .action(async ({ session, options }, text) => {
            if (!text) {
                await session.execute('bertVit -h')
                return null
            }

            const { speaker } = options
            const version = SpeakerIdMap[speaker]

            if (!version) {
                return `找不到这个 ${speaker} 讲者，请检查你的输入。`
            }

            return await vits.say(text, options)
        })
}
