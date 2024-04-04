use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use spl_token::instruction::mint_to;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenMetadata {
    pub file_id: String,
    pub name: String,
    pub weight: u64,
    pub file_parent_id: String,
    pub cid: String,
    pub typ: String,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entered process_instruction");

    let account_info_iter = &mut accounts.iter();

    let mint_account = next_account_info(account_info_iter)?;
    let token_account = next_account_info(account_info_iter)?;
    let mint_authority = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;

    let metadata = TokenMetadata::try_from_slice(instruction_data)?;
    msg!("Deserialized metadata: {:?}", metadata);


    let mint_to_instruction = mint_to(
        token_program.key,
        mint_account.key,
        token_account.key,
        mint_authority.key,
        &[],
        1,
    )?;
    msg!("mint_to instruction prepared");

    msg!("Minting token to {}", token_account.key);
    solana_program::program::invoke(
        &mint_to_instruction,
        &[
            mint_account.clone(),
            token_account.clone(),
            mint_authority.clone(),
            token_program.clone(),
        ],
    )?;

    msg!("mint_to instruction invoked successfully");

    msg!("Token minted with mint address: {}", mint_account.key);


    Ok(())
}
