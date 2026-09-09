// Guards against a half-finished sync being committed. Everything under
// data/protocol is generated, and the pages trust it completely, so a partial
// or inconsistent commit would ship wrong documentation silently.
//
//   npm run check:generated

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const protocolDir = join(docsRoot, "data", "protocol")
const publicAbiDir = join(docsRoot, "public", "abi")

const problems = []
const readJson = path => JSON.parse(readFileSync(path, "utf8"))

const REQUIRED = ["meta.json", "networks.json", "limits.json", "reverts.json", "risk-disclosure.json", "keeper.json"]
for (const file of REQUIRED) {
  if (!existsSync(join(protocolDir, file))) problems.push(`missing data/protocol/${file}`)
}
if (problems.length > 0) {
  console.error(problems.join("\n"))
  process.exit(1)
}

const meta = readJson(join(protocolDir, "meta.json"))

// Every contract the metadata claims must have an ABI, and the copy served from
// the site must be byte-identical to the one the pages read.
for (const contract of meta.contracts) {
  const dataAbi = join(protocolDir, "abi", `${contract.name}.json`)
  const publicAbi = join(publicAbiDir, `${contract.name}.json`)
  if (!existsSync(dataAbi)) {
    problems.push(`meta.json lists ${contract.name} but data/protocol/abi/${contract.name}.json is missing`)
    continue
  }
  if (!existsSync(publicAbi)) {
    problems.push(`${contract.name} is not published at public/abi/${contract.name}.json`)
    continue
  }
  if (readFileSync(dataAbi, "utf8") !== readFileSync(publicAbi, "utf8")) {
    problems.push(`public/abi/${contract.name}.json differs from the ABI the pages read`)
  }
}

// Every network needs a chain id, an endpoint and an explorer, and every
// deployment on disk has to belong to a network that exists.
const networks = readJson(join(protocolDir, "networks.json"))
const keys = new Set(networks.map(network => network.key))
for (const network of networks) {
  if (!network.chainId || !network.rpcUrl || !network.explorer?.url) {
    problems.push(`network ${network.key} is missing a chain id, rpc url or explorer`)
  }
}

const deploymentsDir = join(protocolDir, "deployments")
const onchainDir = join(protocolDir, "onchain")
const listJson = dir =>
  existsSync(dir) ? readdirSync(dir).filter(file => file.endsWith(".json")) : []

for (const file of listJson(deploymentsDir)) {
  const key = file.replace(/\.json$/, "")
  if (!keys.has(key)) problems.push(`deployments/${file} names a network that is not in networks.json`)
  const deployment = readJson(join(deploymentsDir, file))
  const network = networks.find(candidate => candidate.key === key)
  if (network && deployment.chainId !== network.chainId) {
    problems.push(`deployments/${file} is for chain ${deployment.chainId}, network ${key} is ${network.chainId}`)
  }
  if (!deployment.contracts?.SafixPool) problems.push(`deployments/${file} has no SafixPool address`)
}

// A chain snapshot without its deployment record is stale by definition.
for (const file of listJson(onchainDir)) {
  const key = file.replace(/\.json$/, "")
  if (!existsSync(join(deploymentsDir, file))) {
    problems.push(`onchain/${file} has no matching deployment record; re-run npm run sync`)
    continue
  }
  const snapshot = readJson(join(onchainDir, file))
  const deployment = readJson(join(deploymentsDir, file))
  if (snapshot.pool?.address?.toLowerCase() !== deployment.contracts.SafixPool.toLowerCase()) {
    problems.push(`onchain/${file} was read from a different pool than deployments/${file}`)
  }
}

const risk = readJson(join(protocolDir, "risk-disclosure.json"))
if (!Array.isArray(risk.items) || risk.items.length === 0) {
  problems.push("risk-disclosure.json carries no items; the app's risk page did not parse")
}

if (problems.length > 0) {
  console.error(`check-generated: ${problems.length} problem(s)`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(
  `check-generated: ok, ${meta.contracts.length} ABIs, ${networks.length} networks, ${listJson(deploymentsDir).length} deployment(s)`
)
