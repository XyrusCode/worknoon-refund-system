import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PolicyService {
    private readonly logger = new Logger(PolicyService.name);
    private policyText: string;

    constructor() {
        this.policyText = this.loadPolicy();
    }

    private loadPolicy(): string {
        const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

        const candidates = [
            path.join(currentDir, 'refund-policy.md'),
            path.join(process.cwd(), 'src', 'policy', 'refund-policy.md'),
            path.join(process.cwd(), 'dist', 'src', 'policy', 'refund-policy.md'),
            path.join(process.cwd(), 'dist', 'policy', 'refund-policy.md'),
        ];

        for (const p of candidates) {
            try {
                if (fs.existsSync(p)) {
                    this.logger.log(`Loading policy from ${p}`);
                    return fs.readFileSync(p, 'utf-8');
                }
            } catch {
                continue;
            }
        }

        this.logger.warn(
            'Could not load refund policy file, using default policy text',
        );
        return '# Standard 30-day refund policy. Final sale items excluded. Over $500 escalates.';
    }

    getPolicyText(): string {
        return this.policyText;
    }
}
