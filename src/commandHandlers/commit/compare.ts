import { Inject, Injectable } from 'container-ioc';
import { IApplicationShell, ICommandManager } from '../../application/types';
import { CommitDetails, CompareCommitDetails } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitServiceFactory } from '../../types';
import { ICommitViewerFactory } from '../../viewers/types';
import { command } from '../registration';
import { IGitCompareCommandHandler } from '../types';

@Injectable()
export class GitCompareCommitCommandHandler implements IGitCompareCommandHandler {
    private _previouslySelectedCommit?: CommitDetails;

    constructor( @Inject(IServiceContainer) private serviceContainer: IServiceContainer,
        @Inject(ICommandManager) private commandManager: ICommandManager,
        @Inject(ICommitViewerFactory) private commitViewerFactory: ICommitViewerFactory,
        @Inject(IApplicationShell) private application: IApplicationShell) { }

    public get selectedCommit(): CommitDetails | undefined {
        return this._previouslySelectedCommit;
    }

    @command('git.commit.compare.selectForComparison', IGitCompareCommandHandler)
    public async select(commit: CommitDetails): Promise<void> {
        await this.commandManager.executeCommand('setContext', 'git.commit.compare.selectedForComparison', true);
        this._previouslySelectedCommit = commit;
    }

    @command('git.commit.compare', IGitCompareCommandHandler)
    public async compare(commit: CommitDetails): Promise<void> {
        if (!this.selectedCommit) {
            await this.application.showErrorMessage('Please select another file to compare with');
            return;
        }
        await this.commandManager.executeCommand('setContext', 'git.commit.compare.compared', true);
        await this.commandManager.executeCommand('setContext', 'git.commit.compare.view.show', true);
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(commit.workspaceFolder);
        const fileDiffs = await gitService.getDifferences(this.selectedCommit!.logEntry.hash.full, commit.logEntry.hash.full);
        const compareCommit = new CompareCommitDetails(this.selectedCommit, commit, fileDiffs);
        this.commitViewerFactory.getCompareCommitViewer().showCommitTree(compareCommit);
    }
}
