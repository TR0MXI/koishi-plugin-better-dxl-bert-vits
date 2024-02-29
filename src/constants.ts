import path from 'path'
import fs from 'fs'

export const SpeakerIdMap = (function () {
    const dir = path.resolve('data/bert-vits')
    const file = path.resolve(dir, 'speaker.json')

    if (!fs.existsSync(file)) {
        const defaultPath = path.join(__dirname, '../resources/speaker.json')
        fs.mkdirSync(dir)
        fs.copyFileSync(defaultPath, file)
    }

    return JSON.parse(fs.readFileSync(file, 'utf-8'))
})()

// 颠倒 key-value 顺序
export const nameMap = Object.fromEntries(
    Object.entries(SpeakerIdMap).map(([k, v]) => [v, k])
)

const baseSpeakId = 114513

// as {key:value}
export const SpeakerKeyIdMap = Object.entries(SpeakerIdMap)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([k, v], index) => [k, baseSpeakId + index])
    .reduce(
        (acc, [k, v]) => {
            acc[v as number] = k as string
            return acc
        },
        {} as Record<number, string>
    )

export const Language = ['ZH', 'JP', 'EN', 'AUTO', 'MIX']
