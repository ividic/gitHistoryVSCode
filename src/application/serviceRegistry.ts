import { IServiceManager } from '../ioc/types';
import { ApplicationShell } from './applicationShell';
import { CommandManager } from './commandManager';
import { DisposableRegistry } from './disposableRegistry';
import { DocumentManager } from './documentManager';
import { IApplicationShell } from './types';
import { ICommandManager } from './types/commandManager';
import { IDisposableRegistry } from './types/disposableRegistry';
import { IDocumentManager } from './types/documentManager';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IApplicationShell>(IApplicationShell, ApplicationShell);
    serviceManager.addSingleton<ICommandManager>(ICommandManager, CommandManager);
    serviceManager.addSingleton<IDisposableRegistry>(IDisposableRegistry, DisposableRegistry);
    serviceManager.addSingleton<IDocumentManager>(IDocumentManager, DocumentManager);
}
