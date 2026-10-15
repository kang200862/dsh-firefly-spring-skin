/**
 * 宿主半区（browser 半区在 ./client）。
 *
 * 配色、背景与立绘全部由浏览器半区完成 —— 这里不需要任何宿主侧行为，
 * 只保留一条 Loader 行，让 dsh-client-modules 能按包名把 ./client 送到浏览器。
 * 与官方主题包、dsh-theme-plugin、dsh-dream-skin 的做法一致。
 */

export const name = 'firefly-spring-skin'

/** 不提供任何宿主侧行为。 */
export function apply() {}
