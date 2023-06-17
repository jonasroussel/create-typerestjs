import spawn from 'cross-spawn'
import { existsSync, readdirSync } from 'fs'
import fs from 'fs/promises'
import { blue, green, red, reset, yellow } from 'kolorist'
import fetch from 'node-fetch'
import path from 'path'
import prompts from 'prompts'

//--------//
// Consts //
//--------//

const DEFAULT_TARGET_DIR = 'typerestjs-project'
const DEFAULT_VERSION = '1.0.0'

//-----------------//
// Utils Functions //
//-----------------//

function isEmpty(path: string) {
	const files = readdirSync(path)
	return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

function isValidPackageName(projectName: string) {
	return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName)
}

function toValidPackageName(projectName: string) {
	return projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/^[._]/, '')
		.replace(/[^a-z\d\-~]+/g, '-')
}

//------------//
// Entrypoint //
//------------//

async function main() {
	try {
		let targetDir = ''

		const getProjectName = () => (targetDir === '.' ? path.basename(path.resolve()) : targetDir)

		const {
			packageName = getProjectName(),
			overwrite,
			packageManager,
		} = await prompts(
			[
				{
					type: 'text',
					name: 'projectName',
					message: reset('Project name:'),
					initial: DEFAULT_TARGET_DIR,
					onState: ({ value }) => {
						targetDir = value?.trim().replace(/\/+$/g, '') || DEFAULT_TARGET_DIR
					},
				},
				{
					type: () => (!existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm'),
					name: 'overwrite',
					message: () =>
						(targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) +
						` is not empty. Remove existing files and continue?`,
				},
				{
					type: (_, { overwrite }: { overwrite?: boolean }) => {
						if (overwrite === false) {
							throw new Error(red('✖') + ' Operation cancelled')
						}
						return null
					},
					name: 'overwriteChecker',
				},
				{
					type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
					name: 'packageName',
					message: reset('Package name:'),
					initial: () => toValidPackageName(getProjectName()),
					validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name',
				},
				{
					type: 'select',
					name: 'packageManager',
					message: reset('Select a package manager:'),
					choices: [
						{
							title: green('npm'),
							value: 'npm',
						},
						{
							title: blue('yarn'),
							value: 'yarn',
						},
						{
							title: yellow('pnpm'),
							value: 'pnpm',
						},
					],
				},
			],
			{
				onCancel: () => {
					throw new Error(red('✖') + ' Operation cancelled')
				},
			}
		)

		const root = path.join(process.cwd(), targetDir)
		const templateDir = path.resolve(require.main!.path, 'template')

		if (overwrite) await fs.rm(root, { recursive: true, force: true })

		await fs.cp(templateDir, root, { recursive: true })

		let version: string
		try {
			const controller = new AbortController()
			const id = setTimeout(() => controller.abort(), 3_000)

			const data = await fetch('https://registry.npmjs.org/typerestjs', {
				signal: controller.signal,
			}).then<any>((res) => res.json())

			clearTimeout(id)

			version = data['dist-tags'].latest
		} catch (ex) {
			version = DEFAULT_VERSION
		}

		let pkgContent = await fs.readFile(path.resolve(root, 'package.json'), 'utf-8')
		pkgContent = pkgContent.replace('{{name}}', packageName)
		pkgContent = pkgContent.replace('{{version}}', version)
		await fs.writeFile(path.resolve(root, 'package.json'), pkgContent, 'utf-8')

		await fs.rename(`${root}/_gitignore`, `${root}/.gitignore`)

		spawn.sync(packageManager, ['install'], { cwd: root, stdio: 'inherit' })
		spawn.sync('git', ['init'], { cwd: root, stdio: 'ignore' })

		console.log(`\nDone. Now run:\n\n  cd ${targetDir}\n  ${packageManager} run dev\n`)
	} catch (ex: any) {
		console.log(ex.message)
		return
	}
}

main()
