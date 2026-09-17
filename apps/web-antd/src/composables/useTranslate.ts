import { useSys005langStore } from "#/store/sys/sys005lang"

export const useTranslate = () => {
    const langStore = useSys005langStore()

    const t = (key: string) => {
        return langStore.langTranslate[key] || key
    }

    return { t }
}
