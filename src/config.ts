import { Schema } from 'koishi'
// import { Language } from '../lib/list'
import { SpeakerKeyIdMap } from './constants'

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

    | 讲者 | speaker_id
    |-----|-------|
    ` +
    Object.entries(SpeakerKeyIdMap)
        .map((s) => `| ${s[1]} | ${s[0]} |`)
        .join('\n\n')

export interface Config {
    speaker: string
    sdp_ratio: number
    noise: number
    noisew: number
    length: number
    prompt: string
    weight: number
}

export const Config: Schema<Config> = Schema.object({
    speaker: Schema.union(Object.values(SpeakerKeyIdMap))
        .description('默认讲者')
        .default('向晚_ZH'),

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

    // language: Schema.union(Language).description('默认语言').default('ZH'),

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

export const inject = {
    optional: ['vits']
}
