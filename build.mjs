const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './terraform/bin',
  target: 'node',
  naming: {
    asset: 'template.js'
  },
  external: ['sharp']
})

const success = result.success

console.log(`Build ${result.success ? 'Successful': 'Failed'}`)

if (!success) {
  console.error(result.logs)
}
