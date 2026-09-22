/**
 * Wayfinder Route Sync Generator for NestJS -> Frontend
 *
 * Scans NestJS Controllers in backend/src, extracts route decorators (@Controller, @Get, @Post, @Put, @Delete, @Patch),
 * and generates type-safe Wayfinder action descriptors in frontend/src/actions/.
 */

import fs from 'node:fs';
import path from 'node:path';

const BACKEND_SRC = path.resolve('backend/src');
const FRONTEND_ACTIONS = path.resolve('frontend/src/actions');

function extractControllers() {
    const controllers = [];
    const files = fs.readdirSync(BACKEND_SRC, { recursive: true });

    for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.controller.ts')) {
            const fullPath = path.join(BACKEND_SRC, file);
            let content = fs.readFileSync(fullPath, 'utf8');

            const controllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
            const classMatch = content.match(/export\s+class\s+([A-Za-z0-9_]+)/);

            if (controllerMatch && classMatch) {
                const prefix = controllerMatch[1];
                const className = classMatch[1];
                const actions = [];

                // Strip @ApiOperation(...) blocks so their nested parens/braces don't disrupt matching
                const cleanedContent = content.replace(/@ApiOperation\(\s*\{[\s\S]*?\}\s*\)/g, '');

                // Match methods with route decorators
                const methodRegex = /@(Get|Post|Put|Delete|Patch)\((?:['"]([^'"]*)['"])?\)\s*(?:async\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
                let match;
                while ((match = methodRegex.exec(cleanedContent)) !== null) {
                    const method = match[1].toUpperCase();
                    const subpath = match[2] || '';
                    const methodName = match[3];
                    const paramsStr = match[4];

                    const fullUrl = `/${prefix}${subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : ''}`;
                    const hasParams = paramsStr.includes('@Param(');

                    actions.push({
                        methodName,
                        httpMethod: method,
                        url: fullUrl,
                        hasParams,
                        paramsStr,
                    });
                }

                controllers.push({
                    name: className,
                    prefix,
                    actions,
                    file,
                });
            }
        }
    }

    return controllers;
}

function generateActionFile(controller) {
    const domainName = controller.prefix.replace(/^\//, '').toLowerCase();
    const actionObjectName = `${controller.name.replace(/Controller$/, '')}Actions`;

    const methodEntries = new Map();

    for (const act of controller.actions) {
        const paramMatches = [...act.url.matchAll(/:([a-zA-Z0-9_]+)/g)];
        let methodCode;
        if (paramMatches.length > 0) {
            const paramsList = paramMatches.map((m) => `${m[1]}: string`).join(', ');
            let dynamicUrl = act.url;
            for (const m of paramMatches) {
                dynamicUrl = dynamicUrl.replace(`:${m[1]}`, `\${${m[1]}}`);
            }
            methodCode = `(${paramsList}) => ({\n        url: \`${dynamicUrl}\`,\n        method: '${act.httpMethod}' as const,\n    })`;
        } else {
            methodCode = `() => ({\n        url: '${act.url}',\n        method: '${act.httpMethod}' as const,\n    })`;
        }

        // Primary method from controller
        methodEntries.set(act.methodName, methodCode);

        // Standard RESTful / Wayfinder aliases
        if (act.methodName === 'findAll') {
            methodEntries.set('index', methodCode);
        } else if (act.methodName === 'index') {
            methodEntries.set('findAll', methodCode);
        } else if (act.methodName === 'findOne') {
            methodEntries.set('show', methodCode);
        } else if (act.methodName === 'show') {
            methodEntries.set('findOne', methodCode);
        } else if (act.methodName === 'create') {
            methodEntries.set('store', methodCode);
        } else if (act.methodName === 'store') {
            methodEntries.set('create', methodCode);
        } else if (act.methodName === 'findByCustomer') {
            methodEntries.set('byCustomer', methodCode);
        } else if (act.methodName === 'byCustomer') {
            methodEntries.set('findByCustomer', methodCode);
        }
    }

    const rendered = Array.from(methodEntries.entries())
        .map(([name, code]) => `    ${name}: ${code},`)
        .join('\n');

    return `/**
 * Wayfinder Action Descriptors for ${controller.name}
 * Auto-synced from backend/src/${controller.file.replace(/\\/g, '/')}
 */

export const ${actionObjectName} = {
${rendered}
};
`;
}

export function syncWayfinder() {
    console.log('🔄 Scanning NestJS controllers...');
    const controllers = extractControllers();
    console.log(`Found ${controllers.length} controllers: ${controllers.map((c) => c.name).join(', ')}`);

    if (!fs.existsSync(FRONTEND_ACTIONS)) {
        fs.mkdirSync(FRONTEND_ACTIONS, { recursive: true });
    }

    const exportStatements = [];

    for (const ctrl of controllers) {
        const domainName = ctrl.prefix.replace(/^\//, '').toLowerCase();
        const filename = `${domainName}.actions.ts`;
        const filePath = path.join(FRONTEND_ACTIONS, filename);
        const code = generateActionFile(ctrl);

        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`  ✓ Generated frontend/src/actions/${filename}`);
        exportStatements.push(`export * from './${domainName}.actions';`);
    }

    const indexFile = `/**
 * Wayfinder Action Descriptors Barrel
 * Auto-synced from NestJS backend controllers.
 */

${exportStatements.join('\n')}
`;
    fs.writeFileSync(path.join(FRONTEND_ACTIONS, 'index.ts'), indexFile, 'utf8');
    console.log('  ✓ Updated frontend/src/actions/index.ts');
    console.log('✨ Wayfinder sync complete!');
}

syncWayfinder();
