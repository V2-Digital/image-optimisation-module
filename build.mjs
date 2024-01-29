const injectedEnvironmentVariables = [
  'TEST_VAR'
]

const environtmentVariablesDefinition = {}

injectedEnvironmentVariables.forEach(envVariableName => {
  environtmentVariablesDefinition[`process.env.${envVariableName}`] = process.env[envVariableName]
})

const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'node',
  define: {
    ...environtmentVariablesDefinition
  }
})

const success = result.success

console.log(`Build ${result.success ? 'Successful': 'Failed'}`)

if (!success) {
  console.error(result.logs)
}
