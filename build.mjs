const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './terraform/templates',
  
  target: 'node'
})

const success = result.success

console.log(`Build ${result.success ? 'Successful': 'Failed'}`)

if (!success) {
  console.error(result.logs)
}
