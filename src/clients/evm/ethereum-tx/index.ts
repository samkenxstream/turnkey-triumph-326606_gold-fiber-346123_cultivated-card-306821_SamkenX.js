import { Contract, ContractFactory } from '@ethersproject/contracts';
import { AbiCoder, Interface } from '@ethersproject/abi';
import randomBytes from 'randombytes';
import { getAuthenticator } from '../../../authenticators/evm';
import { getStrategiesParams } from '../../../strategies/evm';
import { evmGoerli } from '../../../networks';
import SpaceAbi from './abis/Space.json';
import ProxyFactoryAbi from './abis/ProxyFactory.json';
import AvatarExecutionStrategyAbi from './abis/AvatarExecutionStrategy.json';
import AvatarExecutionStrategyBytecode from './abis/bytecode/AvatarExecutionStrategy.json';
import type { Signer } from '@ethersproject/abstract-signer';
import type { Propose, Vote, Envelope, AddressConfig } from '../types';
import type { EvmNetworkConfig } from '../../../types';

export class EthereumTx {
  networkConfig: EvmNetworkConfig;

  constructor(opts?: { networkConfig: EvmNetworkConfig }) {
    this.networkConfig = opts?.networkConfig || evmGoerli;
  }

  async deployAvatarExecution({
    signer,
    controller,
    target,
    spaces
  }: {
    signer: Signer;
    controller: string;
    target: string;
    spaces: string[];
  }) {
    const factory = new ContractFactory(
      AvatarExecutionStrategyAbi,
      AvatarExecutionStrategyBytecode,
      signer
    );

    const contract = await factory.deploy(controller, target, spaces);

    return contract.address;
  }

  async deploySpace({
    signer,
    controller,
    votingDelay,
    minVotingDuration,
    maxVotingDuration,
    proposalValidationStrategy,
    metadataUri,
    authenticators,
    votingStrategies,
    votingStrategiesMetadata
  }: {
    signer: Signer;
    controller: string;
    votingDelay: number;
    minVotingDuration: number;
    maxVotingDuration: number;
    proposalValidationStrategy: AddressConfig;
    metadataUri: string;
    authenticators: string[];
    votingStrategies: AddressConfig[];
    votingStrategiesMetadata: string[];
  }): Promise<{ txId: string; spaceAddress: string }> {
    const spaceInterface = new Interface(SpaceAbi);
    const proxyFactoryContract = new Contract(
      this.networkConfig.proxyFactory,
      ProxyFactoryAbi,
      signer
    );

    const salt = `0x${randomBytes(32).toString('hex')}`;

    const functionData = spaceInterface.encodeFunctionData('initialize', [
      controller,
      votingDelay,
      minVotingDuration,
      maxVotingDuration,
      proposalValidationStrategy,
      metadataUri,
      votingStrategies,
      votingStrategiesMetadata,
      authenticators
    ]);

    const spaceAddress = await proxyFactoryContract.predictProxyAddress(
      this.networkConfig.masterSpace,
      salt
    );
    const response = await proxyFactoryContract.deployProxy(
      this.networkConfig.masterSpace,
      functionData,
      salt
    );

    return { spaceAddress, txId: response.hash };
  }

  async propose({ signer, envelope }: { signer: Signer; envelope: Envelope<Propose> }) {
    const proposerAddress = envelope.signatureData?.address || (await signer.getAddress());

    const strategiesParams = await getStrategiesParams(
      'propose',
      envelope.data.strategies,
      proposerAddress,
      envelope.data,
      this.networkConfig
    );

    const abiCoder = new AbiCoder();
    const spaceInterface = new Interface(SpaceAbi);
    const functionData = spaceInterface.encodeFunctionData('propose', [
      proposerAddress,
      envelope.data.metadataUri,
      envelope.data.executionStrategy,
      abiCoder.encode(
        ['tuple(int8 index, bytes params)[]'],
        [
          envelope.data.strategies.map((strategyConfig, i) => ({
            index: strategyConfig.index,
            params: strategiesParams[i]
          }))
        ]
      )
    ]);

    const selector = functionData.slice(0, 10);
    const calldata = `0x${functionData.slice(10)}`;

    const authenticator = getAuthenticator(envelope.data.authenticator, this.networkConfig);
    if (!authenticator) {
      throw new Error('Invalid authenticator');
    }

    const { abi, args } = authenticator.createCall(envelope, selector, [calldata]);
    const authenticatorContract = new Contract(envelope.data.authenticator, abi, signer);
    return authenticatorContract.authenticate(...args);
  }

  async vote({ signer, envelope }: { signer: Signer; envelope: Envelope<Vote> }) {
    const voterAddress = envelope.signatureData?.address || (await signer.getAddress());

    const strategiesParams = await getStrategiesParams(
      'propose',
      envelope.data.strategies,
      voterAddress,
      envelope.data,
      this.networkConfig
    );

    const spaceInterface = new Interface(SpaceAbi);
    const functionData = spaceInterface.encodeFunctionData('vote', [
      voterAddress,
      envelope.data.proposal,
      envelope.data.choice,
      envelope.data.strategies.map((strategyConfig, i) => ({
        index: strategyConfig.index,
        params: strategiesParams[i]
      })),
      envelope.data.metadataUri
    ]);

    const selector = functionData.slice(0, 10);
    const calldata = `0x${functionData.slice(10)}`;

    const authenticator = getAuthenticator(envelope.data.authenticator, this.networkConfig);
    if (!authenticator) {
      throw new Error('Invalid authenticator');
    }
    const { abi, args } = authenticator.createCall(envelope, selector, [calldata]);

    const authenticatorContract = new Contract(envelope.data.authenticator, abi, signer);
    return authenticatorContract.authenticate(...args);
  }

  async execute({
    signer,
    space,
    proposal,
    executionParams
  }: {
    signer: Signer;
    space: string;
    proposal: number;
    executionParams: string;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.execute(proposal, executionParams);
  }

  async cancel({ signer, space, proposal }: { signer: Signer; space: string; proposal: number }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.cancel(proposal);
  }

  async getProposal({
    signer,
    space,
    proposal
  }: {
    signer: Signer;
    space: string;
    proposal: number;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.getProposal(proposal);
  }

  async getProposalStatus({
    signer,
    space,
    proposal
  }: {
    signer: Signer;
    space: string;
    proposal: number;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.getProposalStatus(proposal);
  }

  async setMaxVotingDuration({
    signer,
    space,
    maxVotingDuration
  }: {
    signer: Signer;
    space: string;
    maxVotingDuration: number;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.setMaxVotingDuration(maxVotingDuration);
  }

  async setMinVotingDuration({
    signer,
    space,
    minVotingDuration
  }: {
    signer: Signer;
    space: string;
    minVotingDuration: number;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.setMinVotingDuration(minVotingDuration);
  }

  async setMetadataUri({
    signer,
    space,
    metadataUri
  }: {
    signer: Signer;
    space: string;
    metadataUri: string;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.setMetadataURI(metadataUri);
  }

  async setVotingDelay({
    signer,
    space,
    votingDelay
  }: {
    signer: Signer;
    space: string;
    votingDelay: number;
  }) {
    const spaceContract = new Contract(space, SpaceAbi, signer);

    return spaceContract.setVotingDelay(votingDelay);
  }
}
