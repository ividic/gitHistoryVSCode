import { ICommand } from '../common/types';
import { CommittedFile, Hash, LogEntry } from '../types';

export const ICommandHandler = Symbol('ICommandHandler');

export interface ICommandHandler {
}

export const ICommitCommandBuilder = Symbol('ICommitCommandBuilder');

export interface ICommitCommandBuilder {
    getCommitCommands(workspaceFolder: string, _branchName: string | undefined, logEntry: LogEntry): ICommand[];
}

export const IFileCommitCommandBuilder = Symbol('IFileCommitCommandBuilder');

export interface IFileCommitCommandBuilder {
    getFileCommitCommands(workspaceFolder: string, _branch: string | undefined, hash: Hash, committedFile: CommittedFile): ICommand[];
}

export const IGitHistoryCommandHandler = Symbol('IGitHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitHistoryCommandHandler extends ICommandHandler {

}

export const IGitFileHistoryCommandHandler = Symbol('IGitFileHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitFileHistoryCommandHandler extends ICommandHandler {

}

export const IGitCommitCommandHandler = Symbol('IGitCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitCommandHandler extends ICommandHandler {

}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends ICommandHandler {

}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends ICommandHandler {

}

export const IGitCompareCommandHandler = Symbol('IGitCompareCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommandHandler extends ICommandHandler {

}

export const ICommandHandlerManager = Symbol('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
