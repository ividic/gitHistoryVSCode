import { inject, injectable } from 'inversify';
import { CancellationTokenSource, QuickPickItem, window, workspace, WorkspaceFolder } from 'vscode';
import { LogEntry } from '../../browser/src/definitions';
import { command } from '../commands/register';
import { IServiceContainer } from '../ioc/types';
import { BranchSelection, CommittedFile, Hash, IGitServiceFactory, Status } from '../types';
import { IUiService } from './types';

const allBranches = 'All branches';
const currentBranch = 'Current branch';

@injectable()
export class UiService implements IUiService {
    private selectionActionToken?: CancellationTokenSource;
    private previouslySelectedCommit?: LogEntry;
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    public async getBranchSelection(): Promise<BranchSelection | undefined> {
        const itemPickList: QuickPickItem[] = [];
        itemPickList.push({ label: currentBranch, description: '' });
        itemPickList.push({ label: allBranches, description: '' });
        const modeChoice = await window.showQuickPick(itemPickList, { placeHolder: 'Show history for...', matchOnDescription: true });
        if (!modeChoice) {
            return;
        }

        return modeChoice.label === allBranches ? BranchSelection.All : BranchSelection.Current;
    }
    public async getWorkspaceFolder(): Promise<string | undefined> {
        const workspaceFolders = workspace.workspaceFolders;
        if (!Array.isArray(workspaceFolders) || workspaceFolders.length === 0) {
            throw new Error('Please open a workspace folder');
        }
        if (workspaceFolders.length === 1) {
            return workspaceFolders[0].uri.fsPath;
        }
        // tslint:disable-next-line:no-any prefer-type-cast
        const folder: WorkspaceFolder | undefined = await (window as any).showWorkspaceFolderPick({ placeHolder: 'Select a workspace' });
        return folder ? folder.uri.fsPath : undefined;
    }
    public async selectFileCommitCommandAction(committedFile: CommittedFile): Promise<string | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();

        const items = [
            { label: '$(eye) View file contents', command: 'git.commit.file.viewFileContents', description: '' },
            { label: '$(git-compare) Compare against workspace file', command: 'git.commit.file.compareAgainstWorkspace', description: '' }
        ];

        if (committedFile.status !== Status.Added) {
            items.push({ label: '$(git-compare) Compare against previous version', command: 'git.commit.file.compareAgainstPrevious', description: '' });
        }

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        const selection = await window.showQuickPick(items, options);
        if (!selection || items.indexOf(selection) === -1) {
            return undefined;
        }

        return selection.command;
    }
    public async selectCommitCommandAction(hashes: Hash): Promise<string | undefined> {
        if (this.selectionActionToken) {
            this.selectionActionToken.cancel();
        }
        this.selectionActionToken = new CancellationTokenSource();

        // const gitService = this.serviceContainer.get<IGitService>(IGitService);
        // const currentBranchPromise = gitService.getCurrentBranch();

        const items = [
            { label: `$(git-branch) Branch from ${hashes.short}`, command: 'git.commit.branch', description: '' },
            { label: `$(git-pull-request) Cherry pick ${hashes.short} into current branch`, command: 'git.commit.cherryPick', description: '' },
            { label: '$(git-compare) Select for comparison', command: 'git.commit.selectForComparison', description: '' }
        ];

        if (this.previouslySelectedCommit) {
            const label = `$(git-compare) Compare with ${this.previouslySelectedCommit.hash.short}`;
            const description = this.previouslySelectedCommit.subject;
            items.push({ label, command: 'git.commit.compareWithSelected', description });
        }

        const options = { matchOnDescription: true, matchOnDetail: true, token: this.selectionActionToken.token };

        const selection = await window.showQuickPick(items, options);
        if (!selection || items.indexOf(selection) === -1) {
            return undefined;
        }

        return selection.command;
    }

    @command('git.commit.selectForComparison', IUiService)
    public async onCommitSelected(workspaceFolder: string, _branchName: string | undefined, hash: string) {
        const gitService = this.serviceContainer.get<IGitServiceFactory>(IGitServiceFactory).createGitService(workspaceFolder);
        this.previouslySelectedCommit = await gitService.getCommit(hash);
    }
}
